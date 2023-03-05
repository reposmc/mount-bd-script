const fs = require("fs");

const { authorize, listFiles, getFileContent } = require("../libs/drive.js");
const { spawn } = require("child_process");
const axios = require("axios");
const { credentialsByFilter } = require("../services/credentialsApi.js");
const path = require("path");

const getDatabases = async (req, res) => {
  try {
    const auth = await authorize();

    let databases = await listFiles(auth, req.query.filter, req.query.pageSize);

    return res.json({
      message: "success",
      data: databases,
    });
  } catch (error) {
    return res.json({
      message: "fail",
      data: [],
      error,
    });
  }
};

const mountBackup = async (req, res) => {
  try {
    const fileName = req.body.name;
    const fileId = req.body.id;
    const dbName = req.body.databaseName;

    const auth = await authorize();
    const backupPath = path.join(__dirname, `../storage/${fileName}`);

    // Getting the credentials of the database
    const { data } = await credentialsByFilter({
      database: "rentca",
    });
    const dbDriver = data.data[0].driver;

    // Downloading the backup
    await getFileContent(auth, fileId, fileName);

    // Creating the command
    const mountCommand = await createCommand(dbDriver, dbName, backupPath);

    // Mounting the backup
    executeCommand(mountCommand, backupPath);

    return res.json({
      message: "success",
    });
  } catch (error) {
    return res.json({
      message: "fail",
      data: [],
      error,
    });
  }
};

const createCommand = (dbDriver, dbName, backupPath) => {
  let command = "";

  switch (dbDriver) {
    case "mysql":
      const dbUser = process.env.DATABASE_USER_MYSQL;
      const dbPassword = process.env.DATABASE_USER_PASSWORD;

      command = `mysql --column-statistics=0 --u=${dbUser} --p=${dbPassword} ${dbName} < ${backupPath}`;
      //   console.log(command);
      break;
    case "postgres":
      command = `PGPASSWORD=$1 pg_dump -U $2 -h $3 $4 > $5`;
      break;
    case "mongodb":
      command = `mongodump --host $1 --port $2 --db $3  --authenticationDatabase admin --username $4 --password $5 --gzip --archive > $6`;
      break;
  }

  return command;
};

const executeCommand = (mountCommand, backupPath) => {
  const exec = spawn(mountCommand);

  exec.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  exec.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  exec.on("error", (error) => {
    console.log(`error: ${error.message}`);
  });

  exec.on("close", (code) => {
    // Delete the backup file
    // if (fs.existsSync(backupPath)) {
    //   fs.unlinkSync(backupPath);
    // }

    console.log(`child process exited with code ${code}`);
  });
};

module.exports = {
  getDatabases,
  mountBackup,
};
