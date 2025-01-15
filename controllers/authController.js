const passport = require("passport");
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express();

const reqLogin = passport.authenticate("user-local", { session: false });

router.post("/login", reqLogin, async (req, res) => {
  const token = jwt.sign(req.user, process.env.jwt_secret, {
    expiresIn: "1h",
  });

  res.status(200).send({
    message: "login successfully",
    token,
  });
});

module.exports = router;
