const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const actionSchema = new Schema({
  action: { type: String, required: true },                                  // act of kindness
  for: [{ type: String, required: true }],                                   // array of people that this act of kindness is for
  likes: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],     // array of people (user object ids) who like this act of kindness
  done: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],      // array of people (user object ids) who actually carried out this act of kindness
  suggestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // object id of person who suggested this act of kindness
  approved: { type: Boolean, default: false, required: true },               // whether act of kindness is approved by me (in case some people suggest incomplete or unreasonable actions)
  description: { type: String },                                             // optional explanation for act of kindness
  imageLink: { type: String },                                               // optional link to an image that relates to this act of kindness
}, {
  timestamps: true,                                                          // automatically add time that document was created/modified to MongoDB
});

const Action = mongoose.model("Action", actionSchema);

module.exports = Action;