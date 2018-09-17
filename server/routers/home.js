// 获取房间数据
const sql = require('node-transform-mysql');
const mysql = require('../common/db');
const { getUrl, log } = require('../common/fn');
const { tables: { dbhome, dbonline, dbmovie, dbuser }, homePageLen } = require('../common/config');

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
        log('没有获取到房间数据');
        return false;
    }

    const count = Math.ceil(homecount[0]['COUNT(1)'] / homePageLen);

    if (page > count) {
        return { count, homes: [] };
    }

    // 联合查询获取房间数据
    const homes = await mysql(`
        SELECT  
        ${dbhome}.id as id,
        ${dbuser}.name as username,
        ${dbuser}.photo as userphoto,
        ${dbuser}.label as userlabel,
        ${dbmovie}.name as moviename,
        ${dbmovie}.urlx as moviephoto,
        praise, userid, movieid
        FROM ${dbhome}, ${dbuser}, ${dbmovie}
        WHERE ${dbhome}.userid = ${dbuser}.id AND ${dbhome}.movieid = ${dbmovie}.id ${where}
        ORDER BY pv desc LIMIT ${page * homePageLen},${homePageLen};
    `);

    if (!homes || !homes.length) {
        log('获取房间失败');
    }

    return { count, homes: homes || [] };
}

// 获取到该房间的在线用户
async function getUsers(homeid) {
    const users = await mysql(
        sql.table(dbonline).where({ homeid }).field('socketid,udphost,udpport').select()
    );
    if (!users) {
        log('获取在线用户失败');
    }

    return users || [];
}

// 获取用户名称
async function getUserName(id) {
    const user = await mysql(
        sql.table(dbuser).where({ id }).field('name').select()
    );

    if (!user || !user.length) {
        log('获取用户信息失败');
    }
    return user ? user[0].name : false;
}

// 储存socket信息
async function setSocket(socketid, udphost, udpport, userid, homeid) {

    const result = await mysql(
        sql.table(dbonline).data({
            socketid, udphost, udpport, userid, homeid, otime: Date.now()
        }).insert()
    );
    if (!result) {
        log('储存socket信息失败');
    }

    return !!result;
}

// 获取到聊天信息
async function getChat(tableName) {
    const chats = await mysql(`
        SELECT 
        content,userid,name,photo,type
        FROM ${tableName},${dbuser}
        WHERE ${tableName}.userid=${dbuser}.id
        ORDER BY time DESC LIMIT 50
    `);
    if (!chats) {
        log('获取聊天记录失败');
    }

    return chats ? chats.reverse() : [];
}

// 获取房间信息
async function getHome(id) {
    // 获取房间信息
    const home = await mysql(`
        SELECT
        ${dbhome}.id as id,
        ${dbmovie}.name as name,
        ${dbmovie}.file as file,
        ${dbhome}.userid as hostid, 
        movieid, chathostroy, time
        FROM ${dbhome}, ${dbmovie}
        WHERE ${dbhome}.movieid=${dbmovie}.id AND ${dbhome}.id='${id}'
    `);

    if (!home || !home.length) {
        log(`id${id}获取电影数据失败`);
        return false;
    }
    // 转换视频url地址
    home[0].file = getUrl(home[0].file);

    return home[0];
}

module.exports = async (ctx) => {

    let { page, classify, id, option, socketid, udphost, udpport } = ctx.request.body;

    if (ctx.path === '/api/login' || ctx.path === '/api/signin') {
        const data = await getHomeInfor();
        if (!data) {
            ctx.oerror();
            return;
        }
        ctx.body = { ...ctx.body, ...data };
        return;
    }

    if (!option) {
        const data = await getHomeInfor(page, classify);

        if (!data) {
            ctx.oerror();
            return;
        }

        ctx.body = { ...data };
        return;
    }

    const userid = ctx.session.login.id;

    const gethome = async () => {
        if (!id || !socketid || !udphost || !udpport) {
            ctx.oerror();
            return;
        }
        // 获取用户名
        const name = await getUserName(userid);
        // 获取房间信息
        const home = await getHome(id);
        // 储存socket信息
        const onoff = await setSocket(socketid, udphost, udpport, userid, id);
        if (!home || !name || !onoff) {
            ctx.oerror();
            return;
        }
        // 获取聊天信息
        const chats = await getChat(home['chathostroy']);
        // socket初始化
        await ctx.udpsend({
            data: { message: { init: true }, socketid },
            host: udphost,
            port: udpport
        });
        // 推送消息有人上线了
        await ctx.udpOnlineSend(id, name, userid);
        
        ctx.body = { success: true, home, chats, userinfor: { username: name, userid } };
    }

    const message = async () => {
        const { homeid, content, otype } = ctx.request.body;
        if(!homeid || !content || !otype) {
            log('确定参数');
            ctx.oerror();
            return;
        }
        // 获取到属于当前房间的聊天表
        const home = await mysql(
            sql.table(dbhome).where({ id: homeid }).field(['chathostroy']).select()
        );
        if (!home || !home.length) {
            log('没有获取到房间信息');
            ctx.oerror();
            return;
        }
        // 保存消息
        const isSave = await mysql(
            sql.table(home[0].chathostroy).data({
                userid,
                content,
                type: otype,
                time: Date.now()
            }).insert()
        );
        if (!isSave) {
            log('保存聊天记录失败');
            return;
        }
        // 获取当前用户数据
        const user = await mysql(
            sql.table(dbuser).where({ id: userid }).field(['name', 'photo', 'id']).select()
        );
        if (!user || !user.length) {
            log('获取用户数据失败');
            ctx.oerror();
            return;
        }
        // 推送消息
        await ctx.udpHoemSend(homeid, {
            name: user[0].name,
            photo: user[0].photo,
            userid: user[0].id,
            content,
            type: otype
        });

        ctx.body = { success: true };
    }

    switch(option) {
        case 'get':
            await gethome();
            break;
        case 'message':
            await message();
            break;
    }
}