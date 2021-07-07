const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });
const app = require("./app");
const port = process.env.PORT || 9000;
const server = app.listen(port, "127.0.0.1", () => {
  console.log("listening at port", port);
});
// process.on("unhandledRejection", (err) => {
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// process.on("uncaughtException", (err) => {
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
