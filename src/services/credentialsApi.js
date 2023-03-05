const axios = require("axios");

const credentialsApi = axios.create({
  baseURL: `${process.env.CREDENTIALS_API_HOST}:${process.env.CREDENTIALS_API_PORT}`,
  headers: {
    "x-access-token": process.env.CREDENTIALS_API_TOKEN,
  },
});

const credentialsByFilter = async (filter) => {
  const response = await credentialsApi.post(`/credentialsByFilter`, filter);

  return response;
};

module.exports = { credentialsApi, credentialsByFilter };
