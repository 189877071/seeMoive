const sql = require('node-transform-mysql');

const mysql = require('../common/db');

const { tables: { dbmovie }, moviePageLen } = require('../common/config');

const { log } = require('../common/fn');

async function getdata(page = 0, classify = false, search = '') {
    const where = {};
    if (classify) {
        where.classid = classify;
    }
    if (search) {
        where.name = { like: `%${search}%` };
    }
    // 获取数据长度
    const ocount = await mysql(
        sql.table(dbmovie).count().where(where).select()
    );
    
    if (!ocount || !ocount.length) {
        log('获取数据长度失败');
        return false;
    }

    const count = Math.ceil(ocount[0]['COUNT(1)'] / moviePageLen);

    if (page > count) {
        return { count, movies: [] };
    }

    const results = await mysql(
        sql.table(dbmovie).where(where).limit(moviePageLen * page, moviePageLen).field(['id', 'name', 'urlm', 'provider', 'playtime']).select()
    );

    if (!results) {
        log('获取数据失败');
    }
    return { movies: (results && results.length) ? results : [], count };
}

module.exports = async (ctx) => {
    const { page, search, classify } = ctx.request.body;

    const data = await getdata(page, classify, search);
    if(!data) {
        ctx.oerror();
        return;
    }

    ctx.body = {success: true, ...data};
}