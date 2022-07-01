// Jest documentation: https://jestjs.io/docs/using-matchers
// Mongoose Query Documentation: https://mongoosejs.com/docs/queries.html

// Require supertest and app to test HTTP requests/responses for action-related endpoints.
const app = require("../app");
const request = require("supertest");
const setupTests = require("./test-setup");

// Setup MongoDB connection for tests.
setupTests("actions");

// Create example action documents.
const doc1 = {
  "act": "Learn something new about someone",
  "desc": "Have a nice conversation with someone around you to get to know them better.",
  "for": ["stranger", "family", "friends", "yourself"],
  "like": true,
  "did": false,
  "suggester": "6295bd3faf004a11c456da3e"
};
const doc2 = {
  "act": "Send a handwritten letter or postcard to someone",
  "desc": "Brighten a loved one's day by sharing what you appreciate about them!",
  "for": ["family", "friends", "yourself"],
  "like": true,
  "did": true,
  "suggester": "62957314cb99993a91f07ce8",
  "img": "https://raw.githubusercontent.com/venuswku/cherish-api/master/images/handwritten-letter.jpg?token=GHSAT0AAAAAABUX4HZF5SDO5DK66YPFHCF6YUWUFYA"
};

// Start testing.
describe("GET /actions", () => {
  test("Without `for` query parameter -> should get all approved acts of kindness", async () => {
    // Add new documents to our database so that we won't get an empty response.
    const postResponse1 = await request(app).post("/actions/suggest").send(doc1);
    await request(app).post("/actions/suggest").send(doc2);
  
    // Approve the first new document so that we can retrieve it.
    const postedDoc1Result = postResponse1.body.result;
    await request(app).put(`/actions/approve/${postedDoc1Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });
  
    // Get/retrieve all APPROVED actions (only the first newly added action document should be returned).
    await request(app).get("/actions/")
      .expect(200)
      .then((response) => {
        // Check response type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(1);
  
        // Check if required data is returned.
        const retrievedDoc = response.body[0];
        expect(retrievedDoc._id).toBe(postedDoc1Result._id);
        expect(retrievedDoc.action).toBe(postedDoc1Result.action);
        expect(retrievedDoc.for).toStrictEqual(postedDoc1Result.for);
        expect(retrievedDoc.likes).toStrictEqual(postedDoc1Result.likes);
        expect(retrievedDoc.done).toStrictEqual(postedDoc1Result.done);
        expect(retrievedDoc.suggestedBy).toBe(postedDoc1Result.suggestedBy);
        expect(retrievedDoc.approved).toBe(true);
      });
  });

  test("One `for` query parameter -> should get all approved acts of kindness that satisfy the specified `for` query", async () => {
    // Add new documents to our database so that we won't get an empty response.
    const postResponse1 = await request(app).post("/actions/suggest").send(doc1);
    const postResponse2 = await request(app).post("/actions/suggest").send(doc2);
  
    // Approve the first new document so that we can retrieve it.
    const postedDoc1Result = postResponse1.body.result;
    await request(app).put(`/actions/approve/${postedDoc1Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });
  
    // Get/retrieve all APPROVED actions (only the first newly added action document should be returned).
    await request(app).get("/actions?for=friends")
      .expect(200)
      .then((response) => {
        // Check response type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(1);
  
        // Check if required data is returned.
        const retrievedDoc = response.body[0];
        expect(retrievedDoc._id).toBe(postedDoc1Result._id);
        expect(retrievedDoc.action).toBe(postedDoc1Result.action);
        expect(retrievedDoc.for).toStrictEqual(postedDoc1Result.for);
        expect(retrievedDoc.likes).toStrictEqual(postedDoc1Result.likes);
        expect(retrievedDoc.done).toStrictEqual(postedDoc1Result.done);
        expect(retrievedDoc.suggestedBy).toBe(postedDoc1Result.suggestedBy);
        expect(retrievedDoc.approved).toBe(true);
      });
    
    // Approve the second added document so that we can retrieve both documents.
    const postedDoc2Result = postResponse2.body.result;
    await request(app).put(`/actions/approve/${postedDoc2Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });

    // Get/retrieve all APPROVED actions (both newly added action documents should be returned because they share the same `for` value of "family").
    await request(app).get("/actions?for=family")
      .expect(200)
      .then((response) => {
        // Check response type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(2);

        // Make sure all returned actions are approved.
        const actionApprovals = response.body.map(action => action.approved);
        expect(actionApprovals).not.toContain(false);
        
        // Remove `updatedAt` and `approved` properties of each document
        // because they'll be different from their initial values after the approval requests.
        delete postedDoc1Result.updatedAt;
        delete postedDoc2Result.updatedAt;
        delete postedDoc1Result.approved;
        delete postedDoc2Result.approved;
        
        // Check if required data is returned.
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining(postedDoc1Result),
            expect.objectContaining(postedDoc2Result)
          ])
        );
      });

    // Get/retrieve all APPROVED actions (only first newly added action document should be returned because only that document has the `for` value of "stranger").
    await request(app).get("/actions?for=stranger")
      .expect(200)
      .then((response) => {
        // Check response type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(1);

        // Check if required data is returned.
        const retrievedDoc = response.body[0];
        expect(retrievedDoc._id).toBe(postedDoc1Result._id);
        expect(retrievedDoc.action).toBe(postedDoc1Result.action);
        expect(retrievedDoc.for).toStrictEqual(postedDoc1Result.for);
        expect(retrievedDoc.likes).toStrictEqual(postedDoc1Result.likes);
        expect(retrievedDoc.done).toStrictEqual(postedDoc1Result.done);
        expect(retrievedDoc.suggestedBy).toBe(postedDoc1Result.suggestedBy);
        expect(retrievedDoc.approved).toBe(true);
      });
  });

  test("Two or more `for` query parameters -> should get all approved acts of kindness that satisfy at least one of the specified `for` queries", async () => {
    // Add new documents to our database so that we won't get an empty response.
    const postResponse1 = await request(app).post("/actions/suggest").send(doc1);
    const postResponse2 = await request(app).post("/actions/suggest").send(doc2);
  
    // Approve the new documents so that we can retrieve them.
    const postedDoc1Result = postResponse1.body.result;
    await request(app).put(`/actions/approve/${postedDoc1Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });
    const postedDoc2Result = postResponse2.body.result;
    await request(app).put(`/actions/approve/${postedDoc2Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });

    // Get/retrieve all APPROVED actions (both newly added action documents should be returned because they each have at least one of the `for` query values).
    await request(app).get("/actions?for=stranger&for=yourself")
      .expect(200)
      .then((response) => {
        // Check response type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(2);

        // Make sure all returned actions are approved.
        const actionApprovals = response.body.map(action => action.approved);
        expect(actionApprovals).not.toContain(false);
        
        // Remove `updatedAt` and `approved` properties of each document
        // because they'll be different from their initial values after the approval requests.
        delete postedDoc1Result.updatedAt;
        delete postedDoc2Result.updatedAt;
        delete postedDoc1Result.approved;
        delete postedDoc2Result.approved;
        
        // Check if required data is returned.
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining(postedDoc1Result),
            expect.objectContaining(postedDoc2Result)
          ])
        );
      });
  });
});

describe("GET /actions/all", () => {
  test("Without `for` query parameter -> should get all acts of kindness", async () => {
    // Add a new document to our database so that we won't get an empty response.
    const postResponse = await request(app).post("/actions/suggest").send(doc1);
  
    // Get/retrieve the newly added action document.
    await request(app).get("/actions/all")
      .expect(200)
      .then((response) => {
        // Check type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(1);
  
        // Check if required data is returned.
        const postedDoc = postResponse.body.result;
        const retrievedDoc = response.body[0];
        expect(retrievedDoc._id).toBe(postedDoc._id);
        expect(retrievedDoc.action).toBe(postedDoc.action);
        expect(retrievedDoc.for).toStrictEqual(postedDoc.for);
        expect(retrievedDoc.likes).toStrictEqual(postedDoc.likes);
        expect(retrievedDoc.done).toStrictEqual(postedDoc.done);
        expect(retrievedDoc.suggestedBy).toBe(postedDoc.suggestedBy);
        expect(retrievedDoc.approved).toBe(postedDoc.approved);
      });
  });

  test("One `for` query parameter -> should get all acts of kindness that satisfy the specified `for` query", async () => {
    // Add new documents to our database so that we won't get an empty response.
    const postResponse1 = await request(app).post("/actions/suggest").send(doc1);
    const postResponse2 = await request(app).post("/actions/suggest").send(doc2);
  
    // Get/retrieve the newly added action document.
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

  test("Two or more `for` query parameters -> should get all acts of kindness that satisfy at least one of the specified `for` queries", async () => {
    // Add new documents to our database so that we won't get an empty response.
    const postResponse1 = await request(app).post("/actions/suggest").send(doc1);
    const postResponse2 = await request(app).post("/actions/suggest").send(doc2);
  
    // Approve one of the new documents so that we can check if the API retrieves both (doesn't matter if they're approved or not).
    const postedDoc1Result = postResponse1.body.result;
    await request(app).put(`/actions/approve/${postedDoc1Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });
    const postedDoc2Response = await request(app).get(`/actions/get/${postResponse2.body.result._id}`);
    const postedDoc2Result = postedDoc2Response.body;

    // Get/retrieve all APPROVED actions (both newly added action documents should be returned because they each have at least one of the `for` query values).
    await request(app).get("/actions/all?for=stranger&for=yourself")
      .expect(200)
      .then((response) => {
        // Check response type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(2);

        // Remove `updatedAt` and `approved` properties of each document
        // because they'll be different from their initial values after the approval request.
        delete postedDoc1Result.updatedAt;
        delete postedDoc2Result.updatedAt;
        delete postedDoc1Result.approved;
        delete postedDoc2Result.approved;

        // Check if required data is returned.
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining(postedDoc1Result),
            expect.objectContaining(postedDoc2Result)
          ])
        );
      });
  });
});

describe("GET /actions/get/:id", () => {
  test("Specify id of an existing act of kindness -> should retrieve a document with the specified id", async () => {
    // Add new document to our database so that we won't get an empty response.
    const postResponse = await request(app).post("/actions/suggest").send(doc1);

    // Get/retrieve the newly added action document.
    const newAction = postResponse.body.result;
    await request(app).get(`/actions/get/${newAction._id}`)
      .expect(200)
      .then((response) => {
        // Check type of response (null can also be an object, so we need to check response is non-null as well).
        expect(typeof response.body === "object" && response.body !== null).toBeTruthy();
        // Check if received data contains the document that we posted.
        expect(response.body).toEqual(expect.objectContaining(newAction));
      });
  });

  test("Specify id of a nonexistent act of kindness -> should return an error message", async () => {
    await request(app).get("/actions/get/abc123DEF456ghi789JKL")
      .expect(400)
      .then((response) => {
        expect(response.body).toContain("Error getting an act of kindness with the specified id: ");
      });
  });
});

describe("GET /actions/random", () => {
  test("No approved action documents -> should return an error message", async () => {
    await request(app).get("/actions/random")
      .expect(400)
      .then((response) => {
        expect(response.body).toContain("Error getting a random act of kindness: No approved acts of kindness to choose from.");
      });
  });

  test("One approved action document -> should return the only approved document", async () => {
    // Add new documents to our database so that we won't get an empty response.
    const postResponse1 = await request(app).post("/actions/suggest").send(doc1);
    await request(app).post("/actions/suggest").send(doc2);

    // Approve one of the new documents so that we can check if we get the approved document later.
    const postedDoc1Result = postResponse1.body.result;
    await request(app).put(`/actions/approve/${postedDoc1Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });

    // Get/retrieve a random approved action document.
    await request(app).get("/actions/random")
      .expect(200)
      .then((response) => {        
        // Check type.
        const retrievedDoc = response.body;
        expect(retrievedDoc).toBeTruthy();
  
        // Check if required data is returned.
        expect(retrievedDoc._id).toBe(postedDoc1Result._id);
        expect(retrievedDoc.action).toBe(postedDoc1Result.action);
        expect(retrievedDoc.for).toStrictEqual(postedDoc1Result.for);
        expect(retrievedDoc.likes).toStrictEqual(postedDoc1Result.likes);
        expect(retrievedDoc.done).toStrictEqual(postedDoc1Result.done);
        expect(retrievedDoc.suggestedBy).toBe(postedDoc1Result.suggestedBy);
        expect(retrievedDoc.approved).toBe(true);
      });
  });

  test("More than one approved action document -> should return a random approved action document", async () => {
    // Add new documents to our database so that we won't get an empty response.
    const postResponse1 = await request(app).post("/actions/suggest").send(doc1);
    const postResponse2 = await request(app).post("/actions/suggest").send(doc2);

    // Approve both new documents so that we can check if we get one of the approved documents later.
    const postedDoc1Result = postResponse1.body.result;
    const approveResponse1 = await request(app).put(`/actions/approve/${postedDoc1Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });
    const approvedDoc1Result = approveResponse1.body.result;
    const postedDoc2Result = postResponse2.body.result;
    const approveResponse2 = await request(app).put(`/actions/approve/${postedDoc2Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });
    const approvedDoc2Result = approveResponse2.body.result;

    // Get/retrieve a random approved action document.
    await request(app).get("/actions/random")
      .expect(200)
      .then((response) => {        
        // Check type.
        const retrievedDoc = response.body;
        expect(retrievedDoc).toBeTruthy();

        // Check if one of the approved action documents is returned.
        expect([approvedDoc1Result, approvedDoc2Result]).toContainEqual(retrievedDoc);
      });
  });
});

describe("GET /actions/approve/:id", () => {
  test("Approve zero action documents -> should not return any approved action documents", async () => {
    // Add new documents to our database so that we won't get an empty response.
    await request(app).post("/actions/suggest").send(doc1);
    await request(app).post("/actions/suggest").send(doc2);
  
    // Get/retrieve all APPROVED actions.
    await request(app).get("/actions/")
      .expect(200)
      .then((response) => {
        // Check response type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(0);
      });
  });
  
  test("Approve one action document -> should return the only approved action document", async () => {
    // Add new documents to our database so that we won't get an empty response.
    const postResponse1 = await request(app).post("/actions/suggest").send(doc1);
    await request(app).post("/actions/suggest").send(doc2);
  
    // Approve one of the new documents so that we can check if we get the approved document later.
    const postedDoc1Result = postResponse1.body.result;
    await request(app).put(`/actions/approve/${postedDoc1Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });

    // Get/retrieve all APPROVED actions.
    await request(app).get("/actions/")
      .expect(200)
      .then((response) => {
        // Check response type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(1);
  
        // Check if required data is returned.
        const retrievedDoc = response.body[0];
        expect(retrievedDoc._id).toBe(postedDoc1Result._id);
        expect(retrievedDoc.action).toBe(postedDoc1Result.action);
        expect(retrievedDoc.for).toStrictEqual(postedDoc1Result.for);
        expect(retrievedDoc.likes).toStrictEqual(postedDoc1Result.likes);
        expect(retrievedDoc.done).toStrictEqual(postedDoc1Result.done);
        expect(retrievedDoc.suggestedBy).toBe(postedDoc1Result.suggestedBy);
        expect(retrievedDoc.approved).toBe(true);
      });
  });
  
  test("Approve more than one action document -> should return all approved action documents", async () => {
    // Add new documents to our database so that we won't get an empty response.
    const postResponse1 = await request(app).post("/actions/suggest").send(doc1);
    const postResponse2 = await request(app).post("/actions/suggest").send(doc2);

    // Approve both new documents so that we can check get both approved documents later.
    const postedDoc1Result = postResponse1.body.result;
    await request(app).put(`/actions/approve/${postedDoc1Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });
    const postedDoc2Result = postResponse2.body.result;
    await request(app).put(`/actions/approve/${postedDoc2Result._id}`).send({
      "userId": "62957314cb99993a91f07ce8"
    });

    // Get/retrieve all APPROVED actions.
    await request(app).get("/actions/")
      .expect(200)
      .then((response) => {
        // Check response type and length.
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(2);
  
        // Remove `updatedAt` and `approved` properties of each document
        // because they'll be different from their initial values after the approval request.
        delete postedDoc1Result.updatedAt;
        delete postedDoc2Result.updatedAt;
        delete postedDoc1Result.approved;
        delete postedDoc2Result.approved;

        // Check if required data is returned.
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining(postedDoc1Result),
            expect.objectContaining(postedDoc2Result)
          ])
        );
      });
  });
});