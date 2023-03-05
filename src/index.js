const express = require("express");
require("dotenv").config();

const routes = require("./routes/index.routes");

const app = express();

// Accepting json
app.use(express.json());

// Routes
app.use(routes);

app.listen(3001, "0.0.0.0", () => {
  console.log("Server listening on port 3001");
});
