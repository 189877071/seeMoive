const { join } = require('path');

const { appid, secret } = require('./weapp.cf.json');

module.exports = {
    appid,
    secret,
    port: 4567,
    staticPath: join(__dirname, '../static'),
    tables: {
        session: 'movie_mysql_session_store',
        dbuser: 'movie_user',
        dbhome: 'movie_home',
        dbonline: 'movie_line',
        dbmovie: 'movie_list',
        dbclassify: 'movie_classify'
    },
    dev: false,
    expires: 24 * 60 * 60 * 1000,
    ossinfor: {
        accessKeyId: 'LTAIbvYMwsongyJ1',
        accessKeySecret: 'v5ZsESNbdpjcW83sV36bCDxjLWQULf',
        bucket: 'movie-jsonhappy',
        region: 'oss-cn-beijing'
    },
    homePageLen: 5,
    moviePageLen: 10
}