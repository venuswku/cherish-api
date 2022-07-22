const router = require("express").Router();
let Action = require("../models/action.model");
const User = require("../models/user.model");

// Route: /actions/suggest
// Creates a suggested act of kindness, which will later be reviewed/approved by me.
router.route("/suggest").post((req, res) => {
  const {
    act: suggestedAction,
    for: suggestedFor,
    like: suggesterLikes,
    did: suggesterDidAction,
    suggester: suggesterId,
  } = req.body;
  
  // Assign data from POST request to a new instance of Action.
  let actionData = {
    action: suggestedAction,
    for: suggestedFor,
    likes: (suggesterLikes ? [suggesterId] : []),
    done: (suggesterDidAction ? [suggesterId] : []),
    suggestedBy: suggesterId,
    approved: false,
  };
  if (req.body.hasOwnProperty("desc")) {
    actionData["description"] = req.body.desc;
  }
  if (req.body.hasOwnProperty("img")) {
    actionData["imageLink"] = req.body.img;
  }
  const newAction = new Action(actionData);
  
  // Save the new Action instance to the database.
  newAction.save()
    .then(() => res.status(201).json({
      message: "Your suggested act of kindness has been submitted for approval!",
      result: newAction
    }))
    .catch(err => res.status(400).json("Error adding your act of kindness: " + err));
});

// Route: /actions/
// Reads and returns all APPROVED actions from the MongoDB Atlas database.
// If query parameter values with the key "for" are provided, we only return filtered actions.
router.route("/").get((req, res) => {
  const forFilters = req.query.for;
  if (forFilters) {
    Action.find({ "approved": true, "for": { $in: forFilters } })   // find() returns approved actions that match at least one of the given `for` parameter values
      .then(filteredActions => res.json(filteredActions))           // then returns actions in JSON format
      .catch(err => res.status(400).json("Error getting filtered acts of kindness: " + err));
  } else {
    Action.find({ "approved": true })
      .then(actions => res.json(actions))
      .catch(err => res.status(400).json("Error getting all approved acts of kindness: " + err));
  }
});

// Route: /actions/all
// Reads and returns ALL actions from the MongoDB Atlas database.
// If query parameter values with the key "for" are provided, we only return filtered actions.
router.route("/all").get((req, res) => {
  const forFilters = req.query.for;
  if (forFilters) {
    Action.find({ "for": { $in: forFilters } })
      .then(filteredActions => res.json(filteredActions))
      .catch(err => res.status(400).json("Error getting filtered acts of kindness: " + err));
  } else {
    Action.find()
      .then(actions => res.json(actions))
      .catch(err => res.status(400).json("Error getting all acts of kindness: " + err));
  }
});

// Route: /actions/get/:id
// Reads and returns an action with the specified object id, which is automatically generated by MongoDB.
router.route("/get/:id").get((req, res) => {
  Action.findById(req.params.id)
    .then(action => res.json(action))
    .catch(err => res.status(400).json("Error getting an act of kindness with the specified id: " + err));
});

// Route: /actions/random
// Reads and returns a random approved action from the MongoDB Atlas database.
router.route("/random").get((req, res) => {
  Action.countDocuments({ "approved": true }, (err, totalApprovedActions) => {
    if (err) {
      res.status(400).json("Error getting a random act of kindness: Cannot retrieve approved acts of kindness to choose from.");
    } else if (totalApprovedActions === 0) {
      res.status(400).json("Error getting a random act of kindness: No approved acts of kindness to choose from.");
    } else {
      // Calculate a random number of approved documents to skip over before finding an action document to return.
      const randomSkips = Math.floor(Math.random() * totalApprovedActions);
      Action.findOne({ "approved": true }).skip(randomSkips)
        .then(randomAction => res.json(randomAction))
        .catch(err => res.status(400).json("Error getting a random act of kindness: " + err));
    }
  });
});

// Route: /actions/approve/:id
// Updates the approval for an existing action with the specified object id.
router.route("/approve/:id").put((req, res) => {
  const userObjectId = req.body.userId;
  const admins = JSON.parse(process.env.ADMINS);
  if (admins.includes(userObjectId)) {
    Action.findById(req.params.id)
      .then(existingAction => {
        // Approve act of kindness.
        existingAction.approved = true;
        
        // Save update for act of kindness.
        existingAction.save()
          .then(() => {
            res.json({
              message: "The specified act of kindness has successfully been approved.",
              result: existingAction
            });
          })
          .catch(err => res.status(400).json("Error updating approval for an act of kindness: " + err));
      })
      .catch(err => res.status(400).json("Error finding the specified act of kindness to update approval: " + err));
  } else {
    res.status(400).json("Your account cannot be used to approve suggested acts of kindness.");
  }
});

// Route: /actions/like/:id
// Updates the number of likes for an existing action with the specified object id.
router.route("/like/:id").put((req, res) => {
  User.findById(req.body.userId)
    .then(user => {
      // Only update likes if the given user id exists.
      const userObjectId = user._id;
      Action.findById(req.params.id)
        .then(existingAction => {
          // console.log("before update:", existingAction.likes);
          const likeExists = existingAction.likes.includes(userObjectId);
          if (likeExists) {
            // If the user's id is already in the list and they want to remove their like, so remove their object id.
            existingAction.likes.pull(userObjectId);
          } else {
            // Else we don't see the user's object id in the list of people who liked the specified act of kindness, so add them.
            existingAction.likes.push(userObjectId);
          }
          // console.log("after update:", existingAction.likes);
          
          // Make sure to save update for likes.
          existingAction.save()
            .then(() => {
              if (likeExists) { res.json("Your like for an act of kindness has successfully been removed."); }
              else { res.json("Your like for an act of kindness has successfully been added."); }
            })
            .catch(err => res.status(400).json("Error updating likes for an act of kindness: " + err));
        })
        .catch(err => res.status(400).json("Error finding the specified act of kindness to update likes: " + err));
    })
    .catch(err => res.status(400).json("Error finding user to update likes for the specified act of kindness: " + err));
});

// Route: /actions/done/:id
// Updates the number of people who did an existing action with the specified object id.
router.route("/done/:id").put((req, res) => {
  User.findById(req.body.userId)
    .then(user => {
      // Only update likes if the given user id exists.
      const userObjectId = user._id;
      Action.findById(req.params.id)
        .then(existingAction => {
          // console.log("before update:", existingAction.done);
          const doneExists = existingAction.done.includes(userObjectId);
          if (doneExists) {
            // If we've don't see the user's object id in the list of people who did the specified act of kindness, add them.
            existingAction.done.pull(userObjectId);
          } else {
            // Else the user's id is already in the list and they want to remove their done vote, so remove their object id.
            existingAction.done.push(userObjectId);
          }
          // console.log("after update:", existingAction.done);
          
          // Make sure to save update for done.
          existingAction.save()
            .then(() => {
              if (doneExists) { res.json("Your done vote for an act of kindness has successfully been removed."); }
              else { res.json("Your done vote for an act of kindness has successfully been added."); }
            })
            .catch(err => res.status(400).json("Error updating done votes for an act of kindness: " + err));
        })
        .catch(err => res.status(400).json("Error finding the specified act of kindness to update done votes: " + err));
    })
    .catch(err => res.status(400).json("Error finding user to update done votes for the specified act of kindness: " + err));
});

// Route: /actions/:id
// Deletes an action with the specified object id, which is automatically generated by MongoDB.
router.route("/:id").delete((req, res) => {
  const userObjectId = req.body.userId;
  const admins = JSON.parse(process.env.ADMINS);
  if (admins.includes(userObjectId)) {
    Action.findByIdAndDelete(req.params.id)
      .then(() => res.json("Specified act of kindness has successfully been deleted."))
      .catch(err => res.status(400).json("Error deleting an act of kindness: " + err));
  } else {
    res.status(400).json("Your account cannot be used to delete acts of kindness.");
  }
});

module.exports = router;