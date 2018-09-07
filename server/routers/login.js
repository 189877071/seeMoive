// 登录
const sql = require('node-transform-mysql');

const mysql = require('../common/db');

const { tables: { dbuser } } = require('../common/config');

const { getUserInfor } = require('../common/fn');

const init = require('./init');

module.exports = async ctx => {

    const { code } = ctx.request.body;

    if (!code) {
        ctx.oerror(1);
        return;
    }

    const userInfor = await getUserInfor(code);
    if (!userInfor || !userInfor.openid) {
        ctx.oerror(2);
        return;
    }

    const id = userInfor.openid;

    // 判断是否已经注册过
    const isSignin = await mysql(
        sql.table(dbuser).where({ id }).select()
    );

    if (!isSignin || !isSignin.length) {
        ctx.oerror(3);
        return;
    }

    ctx.session.login = { login: true, id };
    
    await init(ctx);
}

