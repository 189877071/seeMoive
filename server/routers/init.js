const sql = require('node-transform-mysql');
const mysql = require('../common/db');
const home = require('./home');
const { tables: { dbclassify, dbuser } } = require('../common/config');
const { log } = require('../common/fn');
// 获取分类
async function getclassify() {
    const results = await mysql(
        sql.table(dbclassify).select()
    );
    if (!results || !results.length) {
        log('获取分类数据失败');
    }
    return (results && results.length) ? results : [];
}

// 获取当前用户数据
async function getUserInfor(id) {
    const result = await mysql(
        sql.table(dbuser).where({ id }).field(['id', 'name', 'photo', 'gender', 'label']).select()
    );
    if (!result || !result.length) {
        log('获取当前用户数据失败');
    }
    return (result && result.length) ? result[0] : false;
}

// 获取初始数据
module.exports = async (ctx) => {
    
    if(!ctx.session.login || !ctx.session.login.id) {
        log('登录没有授权');
        ctx.oerror();
        return;
    }
    
    // 分类
    const classify = await getclassify();

    // 用户数据
    const userinfor = await getUserInfor(ctx.session.login.id);

    if (!userinfor) {
        ctx.oerror();
        return;
    }

    ctx.body = { success: true, classify, userinfor };

    // 在线房间信息
    await home(ctx);
}