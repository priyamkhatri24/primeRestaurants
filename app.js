const express = require("express");
const mongoose = require("mongoose");
const AppError = require("./utils/appError");
const globalErrorController = require("./controllers/globalErrorController");
const helmet = require("helmet");
const mongoExpressSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const restaurantRouter = require("./routes/restaurantRoutes");
const userRouter = require("./routes/userRouter");
const rateLimit = require("express-rate-limit");

const app = express();

// MIDDLEWARES
// adds security headers
app.use(helmet());
app.use(express.json());

// data sanitization to protect against attacks
app.use(mongoExpressSanitize());
app.use(xss());
app.use(hpp()); // removes http parameter pollution

const limiter = rateLimit({
  max: 50,
  windowMs: 1000 * 60 * 60,
  message: "Too many requests from this IP. Please try in an hour",
});
app.use("/api", limiter);

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected with database");
  })
  .catch((err) => console.log(err));

app.use("/api/user", userRouter);
app.use("/api/restaurants", restaurantRouter);

app.all("*", (req, res, next) => {
  // const err = new Error("The url " + req.url + " does not exist");
  // err.statusCode = err.statusCode || 500;
  // err.status = err.status || "error";
  // next(err);
  const err = new AppError(`The url ${req.url} does not exist`, 404);
  next(err);
});

app.use(globalErrorController);

module.exports = app;
