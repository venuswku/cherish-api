const app = require("./app");

// Tell server to start listening to a certain port.
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}/.`);
});