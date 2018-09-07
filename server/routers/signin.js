// 注册
const sql = require('node-transform-mysql');

const https = require('https');

const mysql = require('../common/db');

const { tables: { dbuser } } = require('../common/config');

const { getUserInfor } = require('../common/fn');

const init = require('./init');

module.exports = async ctx => {
    const { avatarUrl, gender, nickName, code } = ctx.request.body;

    if (!avatarUrl || !gender || !nickName || !code) {
        ctx.oerror(1);
        return;
    }

    const userinfor = await getUserInfor(code);

    if (!userinfor || !userinfor.openid) {
        ctx.oerror(2);
        return;
    }

    const success = async () => {
        ctx.session.login = { login: true, id: userinfor.openid };
        await init(ctx);
    }

    // 先判断用户是否已经注册
    const isSignin = await mysql(
        sql.table(dbuser).where({ id: userinfor.openid }).select()
    );
    if(isSignin && isSignin.length) {
        await success();
        return;
    }

    // 注册
    const time = Date.now();
    const result = await mysql(sql.table(dbuser).data({
        id: userinfor.openid,
        name: nickName,
        gender: `${gender}`,
        photo: avatarUrl,
        signintime: time,
        logintime: time
    }).insert());
    if (!result) {
        ctx.oerror(3);
        return;
    }

    await success();
}