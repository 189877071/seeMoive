const Router = require('koa-router');

const multiparty = require('koa2-multiparty');

const router = new Router({
    prefix: '/api'
});

const isLogin = async (ctx, next) => {
    if(!ctx.session.login || !ctx.session.login.id) {
        ctx.oerror();
        return;
    }
    await next();
}

router.post('/login', require('./login'));

router.post('/signin', require('./signin'));

router.post('/home', isLogin, require('./home'));

router.post('/setinfor', isLogin, require('./setinfor'));

router.post('/movie', isLogin, require('./movie'));

router.post('/test', require('./test'));

router.post('/upload', isLogin, multiparty(), require('./upload'));

module.exports = router;