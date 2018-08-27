const Koa = require('koa');
const static = require('koa-static');
const bodyParse = require('koa-bodyparser');
const router = require('./routers')

const { port, staticPath } = require('./common/config');

const app = new Koa();

app.use(static(staticPath));

app.use(bodyParse());

app.use(router.routes());

app.use(router.allowedMethods());

app.listen(port, () => console.log(`启动成功端口号:${port}`));

