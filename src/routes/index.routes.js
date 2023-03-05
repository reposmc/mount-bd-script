const { Router } = require("express");
const {
  mountBackup,
  getDatabases,
} = require("../controllers/backup.controller");

const route = Router();

route.get("/databases", getDatabases);
route.post("/mount", mountBackup);

module.exports = route;
