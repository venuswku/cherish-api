const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Allow environment variables to be stored in the .env file.
require("dotenv").config();

// Initialize Node.js server using an Express web framework.
const app = express();

// Add CORS middleware to allow getting resources from other servers.
app.use(cors());
// Add Express middleware to parse JSON data, which is sent to and from our server.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect server to MongoDB database.
// uri = where Mongo database is stored (get from MongoDB dashboard)
const uri = (process.env.NODE_ENV === "prod") ? process.env.MONGODB_ATLAS_PROD_URI : process.env.MONGODB_ATLAS_TEST_URI;
mongoose.connect(uri);
// Print in terminal once MongoDB connection is open.
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Mongoose database connection established successfully.");
});

// Require/import server routers.
const actionsRouter = require("./routes/actions");
const usersRouter = require("./routes/users");
// Load all possible routes (endpoints for HTTP requests) for each server router.
app.use("/actions", actionsRouter);
app.use("/users", usersRouter);

// Need to separate app from actually starting server (with app.listen() in server.js)
// because we need to export app for SuperTest to import for unit testing.
module.exports = app;