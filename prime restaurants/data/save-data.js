const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Restaurants = require("../Model/restaurantModel");
const fs = require("fs");
dotenv.config({ path: `${__dirname}/../config.env` });

console.log(process.env.DATABASE_LOCAL);

const data = fs.readFileSync(`${__dirname}/person-data.json`, "utf-8");
const DB = process.env.DATABASE_URL.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected with database");
  })
  .catch((err) => console.log(err));

const deleteAll = async () => {
  try {
    await Restaurants.deleteMany();
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const updateAll = async () => {
  console.log("running....");
  const dataArray = JSON.parse(data);
  dataArray.forEach((el) => {
    let ratingSum = 0;
    el.reviews.forEach((ele) => (ratingSum = ratingSum + ele.rating));
    el.ratings = (ratingSum / el.reviews.length).toFixed(1);
  });
  // console.log(dataArray[0]);
  try {
    await Restaurants.create(...dataArray);
    console.log("data saved to db");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const getData = async () => {
  try {
    const data = await Restaurants.find();
    console.log(data);
  } catch (err) {
    console.log("err getting data");
  }
};

if (process.argv[2] === "--import") {
  updateAll();
}
if (process.argv[2] === "--delete") {
  deleteAll();
}
if (process.argv[2] === "--get") {
  getData();
}
