const fs = require("fs").promises;
const filesystem = require("fs");
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const { promisify } = require("util");

const writeFileAsync = promisify(filesystem.writeFile);

// If modifying these scopes, delete token.json.
const SCOPES = [
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.file",
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "./token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "./credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });

  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function listFiles(authClient, q = "", pageSize = 10) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const res = await drive.files.list({
    q: `name contains '${q}'`,
    // q,
    pageSize,
    // fields: "nextPageToken, files(id, name)",
  });
  const files = res.data.files;

  if (files.length === 0) {
    return [];
  }

  // console.log(files);
  return files;
}

/**
 * Downloaded a file from Google Drive.
 *
 * @param {OAuth2Client} authClient
 * @param {String} fileId
 * @param {String} fileName
 * @returns
 */
function getFileContent(authClient, fileId = "", fileName = "") {
  const drive = google.drive({ version: "v3", auth: authClient });
  console.log("Downloading file: " + fileId);

  return new Promise((resolve, reject) => {
    drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" },
      function (err, res) {
        // console.log(res);
        if (!res) {
          return reject("Data not found from google drive file.");
        }

        if (err) {
          return reject("The API returned an error: " + err);
        }
        let buf = [];

        res.data.on("data", function (e) {
          buf.push(e);
        });

        res.data.on("end", async function () {
          const buffer = Buffer.concat(buf);

          try {
            // Creating backup
            await writeFileAsync(`./src/storage/${fileName}`, buffer);

            console.log("File downloaded successfully");
          } catch (error) {
            console.log(error);
          }

          resolve("file saved.");
        });
      }
    );
  });
}

module.exports = {
  loadSavedCredentialsIfExist,
  saveCredentials,
  authorize,
  listFiles,
  getFileContent,
};
