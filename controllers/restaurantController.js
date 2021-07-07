const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Restaurants = require("../Model/restaurantModel");
const APIfeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const User = require("../Model/userModel");

const AliasRestaurants = (req, res, next) => {
  req.query.sort = "-ratings";
  req.query.limit = 5;
  req.query.feilds = "-reviews";
  next();
};

const getAllRestaurants = async (req, res, next) => {
  try {
    let request = new APIfeatures(Restaurants.find(), req.query)
      .filter()
      .sort()
      .limit()
      .paginate(); // WILL NOT DIRECTLY AWAIT BUT AWAIT IT LATER

    const allRestaurants = await request.request;
    res.status(200).send({
      success: true,
      length: allRestaurants.length,
      allRestaurants,
    });
  } catch (err) {
    next(new AppError(err, 404));
  }
};

const addNewRestaurant = async (req, res, next) => {
  // const newrestaurant = new restaurant(req.body)
  try {
    const newRestaurant = await Restaurants.create(req.body);
    res.status(201).send({
      success: true,
      ...newRestaurant,
    });
  } catch (err) {
    // res.status(400).send({
    //   success: false,
    //   message: err,
    // });
    next(new AppError(err, 400));
  }
};

const getSingleRestaurant = async (req, res, next) => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurants.findById(id);
    if (!restaurant) {
      return next(new AppError("Invalid Id", 404));
    }
    res.status(200).send({ success: true, restaurant });
  } catch (err) {
    next(new AppError("Invalid Id", 404));
  }
};

const updateRestaurant = async (req, res, next) => {
  const { id } = req.params;

  try {
    const updatedRestaurant = await Restaurants.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedRestaurant) {
      return next(new AppError("Invalid Id", 404));
    }
    res.status(201).send(updatedRestaurant);
  } catch (err) {
    next(new AppError("Invalid Id", 404));
  }
};

const protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token)
      return next(new AppError("You are not authorized. Please login"), 401);

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
      return next(new AppError("The user no longer exists.", 401));
    req.user = currentUser;
    next();
  } catch (err) {
    next(new AppError(err, 401));
  }
};

module.exports = {
  getAllRestaurants,
  addNewRestaurant,
  getSingleRestaurant,
  updateRestaurant,
  AliasRestaurants,
  protect,
};
