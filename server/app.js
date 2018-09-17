const Koa = require('koa');
const static = require('koa-static');
const bodyParse = require('koa-bodyparser');
const mysql = require('./common/db');
const router = require('./routers')
const session = require('./common/session');
const udpServer = require('./common/udpServer');
const { port, staticPath, tables: { dbonline } } = require('./common/config');
const { log } = require('./common/fn');
const autohome = require('./common/autohome');

const app = new Koa();

app.use(static(staticPath));

app.use(bodyParse());

app.use(session());

app.use(udpServer);

app.use(router.routes());

app.use(router.allowedMethods());

app.listen(port, () => log(`启动成功端口号:${port}`));

async function rests() {
    // 删除在线用户
    await mysql(`TRUNCATE TABLE ${dbonline}`);
    // 系统自动创建一些房间
    autohome();
    // 每15分钟更新一次
    setInterval(autohome, 1000 * 60 * 15);
}

rests();

