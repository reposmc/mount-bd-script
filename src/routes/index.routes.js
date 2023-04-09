const { Router } = require("express");
const {
  mountBackup,
  getDatabases,
} = require("../controllers/backup.controller");

const route = Router();

route.get("/status", (req, res) => {
  res.json({ message: "Active" });
});
route.get("/databases", getDatabases);
route.post("/mount", mountBackup);

module.exports = route;
