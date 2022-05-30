const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String },
}, {
  timestamps: true,                                                          // automatically add time that document was created/modified to MongoDB
});

const User = mongoose.model("User", userSchema);

module.exports = User;