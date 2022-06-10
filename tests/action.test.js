// Jest documentation: https://jestjs.io/docs/using-matchers

// Require supertest and app to test HTTP requests/responses for action-related endpoints.
const app = require("../app");
const request = require("supertest");
const setupTests = require("./test-setup");

// Setup MongoDB connection for tests.
setupTests("actions");

test("GET /actions without `for` query parameter", async () => {
  // Add a new document to our database so that we won't get an empty response.
  const postResponse1 = await request(app).post("/actions/suggest").send({
    "act": "Learn something new about someone",
    "desc": "Have a nice conversation with someone around you to get to know them better.",
    "for": ["stranger", "family", "friends", "yourself"],
    "like": true,
    "did": false,
    "suggester": "6295bd3faf004a11c456da3e"
  });
  await request(app).post("/actions/suggest").send({
    "act": "Send a handwritten letter or postcard to someone",
    "desc": "Brighten a loved one's day by sharing what you appreciate about them!",
    "for": ["family", "friends", "yourself"],
    "like": true,
    "did": true,
    "suggester": "62957314cb99993a91f07ce8",
    "img": "https://raw.githubusercontent.com/venuswku/cherish-api/master/images/handwritten-letter.jpg?token=GHSAT0AAAAAABUX4HZF5SDO5DK66YPFHCF6YUWUFYA"
  });

  // Approve the first new document so that we can retreive it.
  const postedDoc1Result = postResponse1.body.result;
  await request(app).put(`/actions/approve/${postedDoc1Result._id}`).send({
    "userId": "62957314cb99993a91f07ce8"
  });

  // Get/retreive all APPROVED actions (only the first newly added action document should be returned).
  await request(app).get("/actions/")
    .expect(200)
    .then((response) => {
      // Check response type and length.
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toEqual(1);

      // Check if required data is returned.
      const retreivedDoc = response.body[0];
      expect(retreivedDoc._id).toBe(postedDoc1Result._id);
      expect(retreivedDoc.action).toBe(postedDoc1Result.action);
      expect(retreivedDoc.for).toStrictEqual(postedDoc1Result.for);
      expect(retreivedDoc.likes).toStrictEqual(postedDoc1Result.likes);
      expect(retreivedDoc.done).toStrictEqual(postedDoc1Result.done);
      expect(retreivedDoc.suggestedBy).toBe(postedDoc1Result.suggestedBy);
      expect(retreivedDoc.approved).toBe(true);
    });
});

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