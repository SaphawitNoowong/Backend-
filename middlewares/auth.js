const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const extractJwt = require("passport-jwt").ExtractJwt;

const mongoDbInstant = require("../db/mongoDb");
const client = mongoDbInstant.getMongoClient();
const collectionName = "users";

// import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const jwtOptions = {
  jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.jwt_secret,
};

const userSignIn = new LocalStrategy(
  {
    usernameField: "username",
    passwordField: "password",
  },
  async (username, password, done) => {
    try {
      await client.connect();

      const db = client.db(mongoDbInstant.getDbName());
      const collection = db.collection(collectionName);

      const user = await collection.findOne({ username });
      if (!user) {
        return done(null, false, { message: "Username not found." });
      }

      if (!bcrypt.compareSync(password, user.password_hash)) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user, { message: "Logged In Successfully" });
    } catch (error) {
    } finally {
      await client.close();
    }
  }
);

// jwt

const jwtVerify = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    if (payload) {
      const user = payload;
      user.password_hash = null;

      return done(null, user);
    } else {
      return done(null, false, { message: "Unauthorized" });
    }
  } catch (error) {
    return done(null, false, { message: "Unauthorized" });
  }
});

passport.use("user-local", userSignIn);
passport.use("jwt-verify", jwtVerify);

module.exports = passport;