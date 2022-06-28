# Cherish API
To find and share different ways to cherish the people around you, use this API to access and suggest acts of kindness.\
Available at https://venuswku.github.io/cherish-api.

## Endpoints
### Actions
POST `/actions/suggest`
- Suggests a new act of kindness, which needs to be approved before being added to our database.
- Requires authentication.
- The request body needs to be in JSON format and includes the following properties:
  - `act`: suggested act of kindness (required string)
  - `for`: who the act of kindness is for (required array of strings)
  - `like`: whether suggester wants to be the first to like their own suggestion (required boolean)
  - `did`: whether suggester did their suggested act of kindness (required boolean)
  - `suggester`: id of person who suggested this act of kindness (required object id)
  - `desc`: explanation for act of kindness (optional string)
  - `img`: link to an image that relates to this act of kindness (optional string)
- Example request body:
  ```json
  {
    "act": "Send a handwritten letter or postcard to someone",
    "for": ["family", "friends", "yourself"],
    "like": true,
    "did": true,
    "suggester": "62957314cb99993a91f07ce8",
    "desc": "Brighten a loved one's day by sharing what you appreciate about them!",
    "img": "https://raw.githubusercontent.com/venuswku/cherish-api/master/images/handwritten-letter.jpg?token=GHSAT0AAAAAABUX4HZF5SDO5DK66YPFHCF6YUWUFYA"
  }
  ```
- Example response body:
  ```json
  {
    "message": "Your suggested act of kindness has been submitted for approval!",
    "result": {
      "action": "Send a handwritten letter or postcard to someone",
      "for": [ "family", "friends", "yourself" ],
      "likes": [ "62957314cb99993a91f07ce8" ],
      "done": [ "62957314cb99993a91f07ce8" ],
      "suggestedBy": "62957314cb99993a91f07ce8",
      "approved": false,
      "description": "Brighten a loved one's day by sharing what you appreciate about them!",
      "_id": "62a8d544b47565ff4a2181ba",
      "createdAt": "2022-06-13T18:36:52.356Z",
      "updatedAt": "2022-06-13T18:36:52.356Z",
      "__v": 0
    }
  }
  ```

GET `/actions`
- Returns a list of all acts of kindness.
- If `for` query parameters are provided, then acts of kindness containing at least one of the provided query values will be returned.
- Optional query parameters:
  - `for`: who the act of kindness is for (e.g. friends, family, yourself, coworkers, strangers)
- Example request link: http://localhost:5000/actions?for=family&for=yourself

GET `/actions/get/:id`
- Returns detailed information about a single act of kindness with the specified object id.

GET `/actions/random`
- Returns information about a single random act of kindness.

PUT `/actions/approve/:id`
- Approves an act of kindness with the specified id.
  - Only authorized approvers can perform this update.
  - Authorize approvers are stored in the `.env` file.
- Example request body:
  ```json
  {
    "userId": "12345678ab91011c12d13ef0"
  }
  ```
- Example response body:
  ```json
  {
    "message": "The specified act of kindness has successfully been approved.",
    "result": {
      "_id": "62ba8f4e4fe8390449ee3ec8",
      "action": "Send a handwritten letter or postcard to someone",
      "approved": true,
      "createdAt": "2022-06-28T05:19:10.616Z",
      "description": "Brighten a loved one's day by sharing what you appreciate about them!",
      "done": ["62957314cb99993a91f07ce8"],
      "for": ["family", "friends", "yourself"],
      "imageLink": "https://raw.githubusercontent.com/venuswku/cherish-api/master/images/handwritten-letter.jpg?token=GHSAT0AAAAAABUX4HZF5SDO5DK66YPFHCF6YUWUFYA",
      "likes": ["62957314cb99993a91f07ce8"],
      "suggestedBy": "62957314cb99993a91f07ce8",
      "updatedAt": "2022-06-28T05:19:10.655Z"
    }
  }
  ```

PUT `/actions/like/:id`
- Either adds or removes a like for the act of kindness with the specified id.
  - If the user's id is not in the list of people who liked the act, then it increments the number of likes by adding the id of the user.
  - Else it decrements the number of likes because the user's id is already in the list and would like their id to be removed.

PUT `/actions/done/:id`
- Either increments or decrements the number of people who did the act of kindness with the specified id.
  - If the user's id is not in the list of people who did the act, then it increments the number of people who did the act by adding the id of the user.
  - Else it decrements the number of people who did the act because the user's id is already in the list and would like their id to be removed.

DELETE `/actions/:id`
- Removes the act of kindness with the specified id from our database.

## Users
POST `/users/add`
- Creates a new user in our database if they haven't been saved before.
- The request body needs to be in JSON format and includes the following properties:
  - `email`: email of user (required string)
  - `name`: user's name (optional string)
- Example request body:
  ```json
  {
    "email": "venuswku@gmail.com",
    "name": "Venus Ku"
  }
  ```

GET `/users`
- Returns a list of all users who have either suggested an act of kindness or contributed to number of likes/done.
- If either one or both of the following query parameters are included in the request, returns detailed information about user(s) with the specified object id or email.
- Optional query parameters:
  - `id`: object id of a user
  - `email`: email of a user
- Example request link: http://localhost:5000/actions?email=venuswku@gmail.com