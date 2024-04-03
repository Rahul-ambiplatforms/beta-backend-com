// generateSecretKey.js

const crypto = require('crypto');
const fs = require('fs');
const config = require('./config');

const secretKey = crypto.randomBytes(32).toString('hex');

// Save the generated key to the configuration file
config.secretKey = secretKey;

fs.writeFileSync('./config.js', `module.exports = ${JSON.stringify(config, null, 2)};`, 'utf-8');

console.log('Secure Secret Key generated and saved in config.js');
