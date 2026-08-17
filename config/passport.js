const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/prisma");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      async (username, password, done) => {
        try {
          const user = await prisma.user.findUnique({
            where: { username: username },
          });

          if (!user) {
            return done(null, false, { message: "Incorrect username." });
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (isMatch) {
            return done(null, user); 
          } else {
            return done(null, false, { message: "Incorrect password." });
          }
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id },
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
