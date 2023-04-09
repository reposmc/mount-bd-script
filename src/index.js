const express = require("express");
const cors = require("cors");
require("dotenv").config();

const routes = require("./routes/index.routes");
const axios = require("axios");
const { registerService } = require("./libs/service");

const app = express();

// Enabling cors
app.use(cors());

// Accepting json
app.use(express.json());

// Routes
app.use(routes);

app.listen(process.env.PORT, process.env.SERVICE_NAME, async () => {
  await registerService();

  console.log("Server listening on port 3000");
});
