const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: [true, "email already exists"],
    lowercase: true,
    validate: [validator.isEmail, "Is not a valid email"],
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: [
      function (ele) {
        return this.password === ele;
      },
      "Passwords does not match",
    ],
  },
  resetPasswordToken: String,
  resetPasswordExpiresIn: Date,
  active: Boolean,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 8);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  enteredPassword,
  databasePassword
) {
  const correct = await bcrypt.compare(enteredPassword, databasePassword);
  return correct;
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpiresIn = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
