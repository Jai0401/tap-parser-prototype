const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "buffer": require.resolve("buffer/")
    }
  }
};