const axios = require("axios");

const createServiceClient = (baseURL) => {
  return axios.create({
    baseURL,
    timeout: 5000,
  });
};

module.exports = { createServiceClient };