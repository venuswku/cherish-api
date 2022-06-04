const mongoose = require("mongoose");
mongoose.promise = global.Promise;

const removeAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
};

const dropAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      console.log(error.message);
    }
  }
};

// Provide database name since tests in different files will run concurrently/asynchronously (at the same time).
// Tests each file at independent databases.
const setupTests = (databaseName) => {
  // Create a local MongoDB connection before testing.
  beforeAll(async () => {
    const databaseUrl = `mongodb://localhost:27017/${databaseName}`;
    await mongoose.connect(
      databaseUrl,
      { useNewUrlParser: true }
    );
  });
  
  // Cleans up database between each test.
  afterEach(async () => {
    await removeAllCollections();
  });
  
  // Drop database and disconnect from MongoDB after testing.
  afterAll(async () => {
    await dropAllCollections();
    await mongoose.connection.close();
  });
};

module.exports = setupTests;