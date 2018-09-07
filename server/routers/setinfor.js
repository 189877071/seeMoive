const sql = require('node-transform-mysql');

const mysql = require('../common/db');

const { dev, tables: { dbuser } } = require('../common/config');

module.exports = async ctx => {
    const { label } = ctx.request.body;

    if (!ctx.session.login || !ctx.session.login.id || !label) {
        console.log(ctx.session.login, label)
        if(dev){
            console.log('没有登陆或者没有提供label');
        }
        ctx.oerror();
        return;
    }


    const id = ctx.session.login.id;

    const result = await mysql(
        sql.table(dbuser).data({ label }).where({ id }).update()
    );

    if(!result) {
        if(dev){
            console.log('修改失败');
        }
        ctx.oerror();
        return;
    }

    ctx.body = { success: true };
}