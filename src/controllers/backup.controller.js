const fs = require("fs");

const { authorize, listFiles, getFileContent } = require("../libs/drive.js");
const { execSync } = require("child_process");
const { credentialsByFilter } = require("../services/credentialsApi.js");
const path = require("path");

/**
 * List the files that have been backed up on Google Drive.
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
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

/**
 * Mounts the backup file on the database server.
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const mountBackup = async (req, res) => {
  try {
    const fileName = req.body.name;
    const fileId = req.body.id;
    const dbName = req.body.databaseName;
    const dbDriver = req.body.databaseDriver;

    const auth = await authorize();
    const backupPath = path.join(__dirname, `../storage/${fileName}`);

    // Downloading the backup
    const googleDownload = await getFileContent(auth, fileId, fileName);

    if (googleDownload != "file saved.") {
      return res.json({
        message: `File couldn't be saved.`,
      });
    }

    // Getting the credentials of the database
    // console.log("Obtaining the credentials...");
    // const { data } = await credentialsByFilter({
    //   database: dbName,
    // });

    // if (data.data.length == 0) {
    //   return res.status(404).json({
    //     message: "Database name doesn't exists.",
    //   });
    // }

    // const dbDriver = data.data[0].driver;
    // const dbDriver = "mongodb";

    // Creating the command
    const mountCommand = createCommand(dbDriver, dbName, backupPath);

    // Mounting the backup
    executeCommand(mountCommand, backupPath);

    return res.json(
      {
        message: `Backup successfully mounted. Please check the server.`,
      },
      400
    );
  } catch (error) {
    return res.json({
      message: "fail",
      data: [],
      error,
    });
  }
};

/**
 * Creates the command to execute.
 *
 * @param {String} dbDriver
 * @param {String} dbName
 * @param {String} backupPath
 * @returns
 */
const createCommand = (dbDriver, dbName, backupPath) => {
  let command = "";

  let dbHost = "";
  let dbUser = "";
  let dbPassword = "";
  let pathScript = "";

  switch (dbDriver) {
    case "mysql":
      dbHost = process.env.DATABASE_HOST_MYSQL;
      dbUser = process.env.DATABASE_USER_MYSQL;
      dbPassword = process.env.DATABASE_PASSWORD_MYSQL;
      pathScript = path.join(__dirname, "../scripts/mysql.bash");

      command = `sh ${pathScript} ${dbHost} ${dbUser} ${dbPassword} ${dbName} ${backupPath}`;
      break;
    case "postgresql":
      dbHost = process.env.DATABASE_HOST_POSTGRES;
      dbUser = process.env.DATABASE_USER_POSTGRES;
      dbPassword = process.env.DATABASE_PASSWORD_POSTGRES;
      pathScript = path.join(__dirname, "../scripts/postgresql.bash");

      command = `sh ${pathScript} ${dbHost} ${dbUser} ${dbPassword} ${dbName.toLowerCase()} ${backupPath}`;
      break;
    case "mongodb":
      dbHost = process.env.DATABASE_HOST_MONGODB;
      dbUser = process.env.DATABASE_USER_MONGODB;
      dbPassword = process.env.DATABASE_PASSWORD_MONGODB;
      dbPort = process.env.DATABASE_PORT_MONGODB;
      pathScript = path.join(__dirname, "../scripts/mongodb.bash");

      command = `sh ${pathScript} ${dbHost} ${dbUser} ${dbPassword} ${dbName} ${backupPath} ${dbPort}`;
      break;
  }

  return command;
};

/**
 * Executes the command and deletes the database file.
 *
 * @param {String} mountCommand
 * @param {String} backupPath
 */
const executeCommand = (mountCommand, backupPath) => {
  // Executing the command
  execSync(mountCommand, { stdio: "inherit" });

  // Delete the backup file
  if (fs.existsSync(backupPath)) {
    console.log("Deleting backup file");
    fs.unlinkSync(backupPath);
  }
};

module.exports = {
  getDatabases,
  mountBackup,
};
