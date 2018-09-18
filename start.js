const { exec } = require('child_process');

// 启动nginx
exec('/usr/local/nginx/sbin/nginx');

// 启动php
exec('/etc/init.d/php-fpm');

// 启动 webchat-moblie 服务
exec('node /webserver/webckat-moblie/server/server.js');

// 启动 v2 版
exec('node /webserver/webchat2.0/server/start.js');

// 启动 pc 版
exec('node /webserver/webchat-pc/start.js');

// 启动小程序
exec('node /webserver/see-movie/start.js');