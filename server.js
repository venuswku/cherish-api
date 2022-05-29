const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Allow environment variables to be stored in the .env file.
require("dotenv").config();

// Initialize Node.js server using an Express web framework.
const app = express();
const port = process.env.PORT || 5000;

// Add CORS middleware to allow getting resources from other servers.
app.use(cors());
// Add Express middleware to parse JSON data, which is sent to and from our server.
app.use(express.json());

// Connect server to MongoDB database.
const uri = process.env.ATLAS_URI;  // uri = where Mongo database is stored (get from MongoDB dashboard)
mongoose.connect(uri, { useNewParser: true, useCreateIndex: true });  // useNewParse and useCreateIndex are flags used to handle updates to MongoDB
// Print in terminal once MongoDB connection is open.
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Mongoose database connection established successfully.");
});

// Require/import server routers.
const actionsRouter = require("./routes/actions");
// Load all possible routes (endpoints for HTTP requests) for each server router.
app.use("/actions", actionsRouter);

// Tell server to start listening to a certain port.
app.listen(port, () => {
  console.log(`Server is running on port: ${port}.`);
});