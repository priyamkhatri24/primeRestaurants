const express = require("express");
const restaurantController = require("../controllers/restaurantController");
const restaurantRouter = express.Router();

restaurantRouter
  .route("/top-5")
  .get(
    restaurantController.AliasRestaurants,
    restaurantController.getAllRestaurants
  );

restaurantRouter
  .route("/")
  .get(restaurantController.getAllRestaurants)
  .post(restaurantController.addNewRestaurant);
restaurantRouter
  .route("/:id")
  .get(restaurantController.getSingleRestaurant)
  .patch(restaurantController.updateRestaurant);

module.exports = restaurantRouter;
