const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const actionSchema = new Schema({
  action: { type: String, required: true },                     // suggested act of kindness
  description: { type: String, required: true },                // explanation of act of kindness
  for: [{ type: String, required: true }],                      // array of people that this act of kindness is for
  likes: [{ type: Schema.Types.ObjectId, required: true }],     // array of people (user object ids) who like this act of kindness
  done: [{ type: Schema.Types.ObjectId, required: true }],      // array of people (user object ids) who actually carried out this act of kindness
  approved: { type: Boolean, default: false, required: true },  // whether act of kindness is approved by me (in case some people suggest incomplete or unreasonable actions)
  suggestedBy: { type: Schema.Types.ObjectId },                 // name of person who suggested this act of kindness (optional field)
  image: { type: String },                                      // link to an image that relates to this act of kindness (optional field)
}, {
  timestamps: true,                                             // automatically add time that document was created/modified to MongoDB
});

const Action = mongoose.model("Action", actionSchema);

module.exports = Action;