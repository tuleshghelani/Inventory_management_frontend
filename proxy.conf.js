const { environment } = require('./src/environments/environment');

module.exports = {
  "/api": {
    target: environment.apiUrl,
    secure: false,
    changeOrigin: true
  }
} 