const Koa = require('koa');
const static = require('koa-static');
const bodyParse = require('koa-bodyparser');
const router = require('./routers')
const session = require('./common/session');
const { udpsend, udpexit, udpsends } = require('./common/udpServer');
const { port, staticPath } = require('./common/config');
const autohome = require('./common/autohome');

const app = new Koa();

app.use(static(staticPath));

app.use(bodyParse());

app.use(session());

app.use(async (ctx, next) => {
    ctx.oerror = (error = 0) => ctx.body = ({ error, success: false });
    ctx.udpsend = udpsend;
    ctx.udpexit = udpexit;
    ctx.udpsends = udpsends;
    await next();
});

app.use(router.routes());

app.use(router.allowedMethods());

app.listen(port, () => console.log(`启动成功端口号:${port}`));

// 系统自动创建一些房间
autohome();
// 每15分钟更新一次
setInterval(autohome, 1000 * 60 * 15);