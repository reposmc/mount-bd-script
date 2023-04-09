const axios = require("axios");

const credentialsApi = axios.create({
  baseURL: `${process.env.CREDENTIALS_API_HOST}:${process.env.CREDENTIALS_API_PORT}`,
});

const credentialsByFilter = async (filter) => {
  const response = await credentialsApi.post(`/credentialsByFilter`, filter);

  return response;
};

module.exports = { credentialsApi, credentialsByFilter };
