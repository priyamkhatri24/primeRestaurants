const User = require("../Model/userModel");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const sendMail = require("../email");
const crypto = require("crypto");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

const createCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.MODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
};

exports.userSignup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);

    const token = createToken(newUser._id);
    createCookie(res, token);
    res.status(201).send({
      success: true,
      token,
      ...newUser._doc,
    });
  } catch (err) {
    next(new AppError(err, 404));
  }
};

exports.userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new AppError("Please provide email and password"), 400);
    const user = await User.findOne({ email });
    if (!user || !(await user.correctPassword(password, user.password)))
      return next(new AppError("Invalid email or password"), 401);
    const token = createToken(user._id);
    createCookie(res, token);

    req.user = user;
    res.status(200).send({
      email,
      token,
    });
  } catch (err) {
    next(new AppError(err, 400));
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      next(new AppError("The user with this email does not exists."), 404);
    }
    const resetToken = user.generatePasswordResetToken();
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/user/resetPassword/${resetToken}`;

    await user.save({ validateBeforeSave: false });
    const message = `Forgot password? you can send a patch request to the following url: ${resetURL}`;
    await sendMail({
      email: req.body.email,
      subject: "reset password request (valid for 10 minutes)",
      message,
    });
    res.status(200).send({
      success: true,
      message: "email successfully sent to " + req.body.email,
    });
  } catch (err) {
    next(new AppError(err, 404));
  }
};

exports.resetPassword = async (req, res, next) => {
  const token = req.params.token;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user)
      return next(
        new AppError(
          "The user does not exist or the token has been expired",
          400
        )
      );

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresIn = undefined;

    await user.save();

    res.status(200).send({
      email: req.body.email,
      token,
    });
  } catch (err) {
    next(new AppError(err, 400));
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError("The user does not exists", 404));

    const isPasswordCorrect = await user.correctPassword(
      req.body.oldPassword,
      req.user.password
    );
    if (!isPasswordCorrect)
      return next(new AppError("The old password is not correct", 400));

    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    res.status(200).send({
      success: true,
      user,
    });
  } catch (err) {
    next(new AppError(err, 404));
  }
};

const filterObj = (reqObj, ...includedFeilds) => {
  const filteredObj = {};
  Object.keys(reqObj).forEach((ele) => {
    if (includedFeilds.includes(ele)) {
      filteredObj[ele] = reqObj[ele];
    }
  });
  return filteredObj;
};

exports.updateUserfeilds = async (req, res, next) => {
  try {
    const filteredObj = filterObj(req.body, "email", "name");
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) return next(new AppError("This user does not exist"));

    res.status(200).send({
      success: true,
      updatedUser,
    });
  } catch (err) {
    next(new AppError(err, 400));
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const deleteUser = await User.findByIdAndUpdate(req.user.id, {
      active: false,
    });
    res.status(204).send({
      success: true,
    });
  } catch (err) {
    next(new AppError(err, 400));
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ active: { $ne: false } });

    res.status(200).send({
      success: true,
      userCount: users.length,
      users,
    });
  } catch (err) {
    next(new AppError(err, 400));
  }
};
