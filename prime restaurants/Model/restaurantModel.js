const mongoose = require("mongoose");
const validator = require("validator");
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 4,
    },
    neighborhood: {
      type: String,
    },
    photograph: {
      type: String,
      validate: {
        validator: function () {
          return validator.isURL(this.photograph);
        },
        message: "Not a valid url",
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    latlng: {
      type: Object,
    },
    cuisine_type: {
      type: String,
      required: true,
      trim: true,
      validate: [validator.isAlpha, "Not a valid cuisine type"],
    },
    operating_hours: String,
    reviews: [Object],
    ratings: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

restaurantSchema.virtual("pincode").get(function () {
  return this.address.split(" ").reverse()[0];
});

restaurantSchema.pre("save", function (next) {
  // document middleware
  this.averageRatings = 5;
  next();
});

restaurantSchema.pre("find", function (next) {
  // Query middleware
  this.find({ ratings: { $gt: 1 } });
  next();
});

const Restaurants = new mongoose.model("Restaurants", restaurantSchema);

module.exports = Restaurants;
