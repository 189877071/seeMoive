const Router = require('koa-router');

const router = new Router({
    prefix: '/api'
});

router.post('/login', require('./login'));

router.post('/signin', require('./signin'));

router.post('/home', require('./home'));

router.post('/setinfor', require('./setinfor'));

router.post('/movie', require('./movie'));

module.exports = router;