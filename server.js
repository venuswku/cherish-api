const app = require("./app");

// Tell server to start listening to a certain port.
if (process.env.NODE_ENV === "prod") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}/.`);
  });
}