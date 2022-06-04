// Jest documentation: https://jestjs.io/docs/using-matchers

// Require supertest and app to test HTTP requests/responses for action-related endpoints.
const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");

// Connect to the test MongoDB before each test case.
beforeEach((done) => {
	mongoose.connect(
		process.env.MONGODB_ATLAS_TEST_URI,
		{ useNewUrlParser: true },
		() => done()
	);
});

// Drop database and close the connection after each test case runs.
afterEach((done) => {
	mongoose.connection.db.dropDatabase(() => {
		mongoose.connection.close(() => done());
	});
});

afterAll((done) => mongoose.connection.close(() => done()));

test("GET /actions/all without `for` query parameter", async () => {
  // Add a new document to our database so that we won't get an empty response.
  const postResponse = await request(app).post("/actions/suggest").send({
    "act": "Learn something new about someone",
    "desc": "Have a nice conversation with someone around you to get to know them better.",
    "for": ["stranger", "family", "friends", "yourself"],
    "like": true,
    "did": false,
    "suggester": "6295bd3faf004a11c456da3e"
  });

  // Get/retreive the newly added action document.
  await request(app).get("/actions/all")
    .expect(200)
    .then((response) => {
      // Check type and length.
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toEqual(1);

      // Check if required data is returned.
      const postedDoc = postResponse.body.result;
      const retreivedDoc = response.body[0];
      expect(retreivedDoc._id).toBe(postedDoc._id);
      expect(retreivedDoc.action).toBe(postedDoc.action);
      expect(retreivedDoc.for).toStrictEqual(postedDoc.for);
      expect(retreivedDoc.likes).toStrictEqual(postedDoc.likes);
      expect(retreivedDoc.done).toStrictEqual(postedDoc.done);
      expect(retreivedDoc.suggestedBy).toBe(postedDoc.suggestedBy);
      expect(retreivedDoc.approved).toBe(postedDoc.approved);
    });
});


test("GET /actions/all with one `for` query parameter", async () => {
  // Add new documents to our database so that we won't get an empty response.
  const postResponse1 = await request(app).post("/actions/suggest").send({
    "act": "Learn something new about someone",
    "desc": "Have a nice conversation with someone around you to get to know them better.",
    "for": ["stranger", "family", "friends", "yourself"],
    "like": true,
    "did": false,
    "suggester": "6295bd3faf004a11c456da3e"
  });
  const postResponse2 = await request(app).post("/actions/suggest").send({
    "act": "Send a handwritten letter or postcard to someone",
    "desc": "Brighten a loved one's day by sharing what you appreciate about them!",
    "for": ["family", "friends", "yourself"],
    "like": true,
    "did": true,
    "suggester": "62957314cb99993a91f07ce8",
    "img": "https://raw.githubusercontent.com/venuswku/cherish-api/master/images/handwritten-letter.jpg?token=GHSAT0AAAAAABUX4HZF5SDO5DK66YPFHCF6YUWUFYA"
  });

  // Get/retreive the newly added action document.
  await request(app).get("/actions/all?for=friends")
    .expect(200)
    .then((response) => {
      // Check type and length.
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toEqual(2);

      // Check if received data contains the documents that we posted.
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining(postResponse1.body.result),
          expect.objectContaining(postResponse2.body.result)
        ])
      );
    });
});