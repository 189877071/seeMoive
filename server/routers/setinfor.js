const sql = require('node-transform-mysql');

const mysql = require('../common/db');

const { tables: { dbuser } } = require('../common/config');

const { log } = require('../common/fn');

module.exports = async ctx => {
    const { label } = ctx.request.body;

    if (!label) {
        log('没有提供label');
        ctx.oerror();
        return;
    }


    const id = ctx.session.login.id;

    const result = await mysql(
        sql.table(dbuser).data({ label }).where({ id }).update()
    );

    if(!result) {
        log('修改失败');
        ctx.oerror();
        return;
    }

    ctx.body = { success: true };
}