const express = require("express");
const userController = require("../controllers/userController");
const userRouter = express.Router();
const restaurantController = require("../controllers/restaurantController");

userRouter.route("/getUsers").get(userController.getAllUsers);
userRouter.route("/signup").post(userController.userSignup);
userRouter.route("/login").post(userController.userLogin);
userRouter.route("/forgotpassword").post(userController.forgotPassword);
userRouter.route("/resetPassword/:token").patch(userController.resetPassword);
userRouter
  .route("/updatePassword")
  .patch(restaurantController.protect, userController.updatePassword);
userRouter
  .route("/updateMe")
  .patch(restaurantController.protect, userController.updateUserfeilds);
userRouter
  .route("/deleteMe")
  .delete(restaurantController.protect, userController.deleteUser);

module.exports = userRouter;
