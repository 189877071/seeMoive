const { join } = require('path');

const {appid, secret} = require('./weapp.cf.json');

module.exports = {
    appid, 
    secret,
    port: 4567,
    staticPath: join(__dirname, '../static')
}