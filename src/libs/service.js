const axios = require("axios");

const registerService = async () => {
  try {
    const response = await axios.post(process.env.API_GATEWAY_URL, {
      serviceName: process.env.SERVICE_NAME,
      loadBalancerMethod: process.env.LOAD_BALANCER_METHOD,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      protocol: process.env.PROTOCOL,
      host: process.env.HOST,
      port: process.env.PORT,
    });

    console.log(response.data);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  registerService,
};
