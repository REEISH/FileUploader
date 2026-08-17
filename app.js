const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { prisma } = require("./lib/prisma");
const path = require("node:path");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

require("./config/passport")(passport);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/styles', express.static(path.join(__dirname, 'styles')));

app.use(
  session({
    secret: "super_secret_file_uploader_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10080000,
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/folders", require("./routes/folders"));
app.use("/files", require("./routes/files"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
