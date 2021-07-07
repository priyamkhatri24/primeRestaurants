const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Restaurants = require("../Model/restaurantModel");
const fs = require("fs");
dotenv.config({ path: `${__dirname}/../config.env` });

console.log(process.env.DATABASE_LOCAL);

const data = fs.readFileSync(`${__dirname}/person-data.json`, "utf-8");
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected with database");
    if (process.argv[2] === "--import") {
      updateAll();
    }
    if (process.argv[2] === "--delete") {
      deleteAll();
    }
  })
  .catch((err) => console.log(err));

const deleteAll = async (req, res) => {
  try {
    const restaurants = await Restaurants.deleteMany({});
    res.send(restaurants);
  } catch (err) {
    res.send(err);
  }
};

const updateAll = async (req, res) => {
  console.log("running....");
  const dataArray = JSON.parse(data);
  dataArray.forEach((el) => {
    let ratingSum = 0;
    el.reviews.forEach((ele) => (ratingSum = ratingSum + ele.rating));
    el.ratings = (ratingSum / el.reviews.length).toFixed(1);
  });
  // console.log(dataArray[0]);
  try {
    const rest = await Restaurants.create(dataArray);
    console.log("sent");
    res.send(rest);
  } catch (err) {
    console.log("err");
  }
};
