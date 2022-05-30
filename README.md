# Cherish API
To find and share different ways to cherish the people around you, use this API to access and suggest acts of kindness.\
Available at https://venuswku.github.io/cherish-api.

## Endpoints
### Actions
GET `/actions`
- Returns a list of all acts of kindness.
- Optional query parameters:
  - `for`: who the act of kindness is for (e.g. friends, family, yourself, coworkers, strangers)

GET `/actions/:id`
- Returns detailed information about a single act of kindness with the specified object id.

POST `/actions/suggest`
- Suggests a new act of kindness, which needs to be approved before being added to our database.
- Requires authentication.
- The request body needs to be in JSON format and includes the following properties:
  - `act`: suggested act of kindness (required string)
  - `desc`: explanation for act of kindness (required string)
  - `for`: who the act of kindness is for (required array of strings)
  - `like`: whether suggester wants to be the first to like their own suggestion (required boolean)
  - `did`: whether suggester did their suggested act of kindness (required boolean)
  - `suggester`: id of person who suggested this act of kindness (required object id)
  - `img`: link to an image that relates to this act of kindness (optional string)

POST `/actions/like/:id`
- Either adds or removes a like for the act of kindness with the specified id.
  - If the user's id is not in the list of people who liked the act, then it increments the number of likes by adding the id of the user.
  - Else it decrements the number of likes because the user's id is already in the list and would like their id to be removed.

POST `/actions/done/:id`
- Either increments or decrements the number of people who did the act of kindness with the specified id.
  - If the user's id is not in the list of people who did the act, then it increments the number of people who did the act by adding the id of the user.
  - Else it decrements the number of people who did the act because the user's id is already in the list and would like their id to be removed.

DELETE `/actions/:id`
- Removes the act of kindness with the specified id from our database.

## Users
GET `/users`
- Returns a list of all users who have either suggested an act of kindness or contributed to number of likes/done.

GET `/users/:id`
- Returns detailed information about a single user with the specified object id.

POST `/users/add`
- Creates a new user in our database if they haven't been saved before.
- The request body needs to be in JSON format and includes the following properties:
  - `email`: email of user (required string)
  - `name`: user's name (optional string)