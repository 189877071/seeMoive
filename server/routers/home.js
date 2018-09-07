// 获取房间数据
const sql = require('node-transform-mysql');
const mysql = require('../common/db');

const { dev, tables: { dbhome, dbonline }, homePageLen } = require('../common/config');

// 获取以热门排序的房间数据
async function getHomeInfor(page = 0, classify = false) {

    let countwhere = {};
    let where = '';
    if (classify) {
        countwhere.classify = classify;
        where += `AND classify=${classify}`
    }
    // 先获取数据长度
    const homecount = await mysql(
        sql.table(dbhome).count().where(countwhere).select()
    );

    // 一共有多少页数据
    if (!homecount || !homecount.length) {
        if (dev) {
            console.log('没有获取到房间数据');
        }
        return false;
    }

    const count = Math.ceil(homecount[0]['COUNT(1)'] / homePageLen);

    if (page > count) {
        return { count, homes: [] };
    }

    // 联合查询获取房间数据
    const homes = await mysql(`
        SELECT  
        movie_home.id as id,
        movie_user.name as username,
        movie_user.photo as userphoto,
        movie_user.label as userlabel,
        movie_list.name as moviename,
        movie_list.urlx as moviephoto,
        praise, userid, movieid
        FROM movie_home, movie_user, movie_list
        WHERE movie_home.userid = movie_user.id AND movie_home.movieid = movie_list.id ${where}
        ORDER BY pv desc LIMIT ${page * homePageLen},${homePageLen};
    `);

    if (!homes || !homes.length) {
        if (dev) {
            console.log('获取房间失败');
        }
    }

    return { count, homes: homes || [] };
}

module.exports = async (ctx) => {

    let { page, classify } = ctx.request.body;

    if (ctx.path === '/api/login' || ctx.path === '/api/signin') {
        const data = await getHomeInfor();
        if (!data) {
            ctx.oerror();
            return;
        }
        ctx.body = { ...ctx.body, ...data };
        return;
    }

    const data = await getHomeInfor(page, classify);

    if (!data) {
        ctx.oerror();
        return;
    }
    
    ctx.body = { ...data };
}