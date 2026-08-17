const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/prisma");
const { authValidator } = require("../middleware/validators");

router.post("/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      return res.redirect("/?error=UsernameExists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        storageUsed: 0,
      },
    });
    req.login(newUser, (err) => {
      if (err) return next(err);
      return res.redirect("/dashboard");
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/login",
  authValidator,
  passport.authenticate("local", {
    failureRedirect: "/?error=LoginFailed",
  }),
  (req, res) => {
    res.redirect("/dashboard");
  },
);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = router;
