// Require supertest and app to test HTTP requests/responses for action-related endpoints.
const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");

// // Connect to MongoDB before all tests. -> don't need this because we already connected to database in app.js!
// beforeAll(() => {
//   mongoose.connect(process.env.MONGODB_ATLAS_TEST_URI,
//     { useNewUrlParser: true, useUnifiedTopology: true }
//   );
// });

// Clear out all data in test database after each test case.
afterEach(() => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    collection.deleteMany();
  }
});

// // Disconnect and close database connection after all test cases ran.
// afterAll(async () => {
//   await mongoose.connection.dropDatabase();
//   await mongoose.connection.close();
// });

test("GET /actions", async () => {
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
  await request(app).get("/actions")
    .expect(200)
    .then((response) => {
      // Check type and length.
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toEqual(1);

      // Check data.
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