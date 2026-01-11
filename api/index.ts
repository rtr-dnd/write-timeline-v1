// eslint-disable-next-line
const { createRequestHandler } = require('expo-server/adapter/vercel');

module.exports = createRequestHandler({
  // eslint-disable-next-line
  build: require('path').join(__dirname, '../dist/server'),
});