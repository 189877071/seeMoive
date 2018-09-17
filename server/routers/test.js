// 测试
const sql = require('node-transform-mysql');

const mysql = require('../common/db');

const { tables: { dbuser, dbhome, dbmovie, dbonline } } = require('../common/config');

const { log } = require('../common/fn');

module.exports = async ctx => {

    const { option } = ctx.request.body;

    const init = async () => {
        // 先获取用户
        const users = await mysql(
            sql.table(dbuser).where({ demo: '3' }).field(['id', 'name', 'photo']).select()
        );

        if (!users || !users.length) {
            log('获取用户失败');
            ctx.oerror();
            return;
        }

        // 获取所有房间
        const homes = await mysql(`
        SELECT
        ${dbhome}.id as id,
        ${dbmovie}.name as name,
        ${dbmovie}.file as file,
        userid, movieid, chathostroy, time
        FROM ${dbhome}, ${dbmovie}
        WHERE ${dbhome}.movieid=${dbmovie}.id
        `);

        if (!homes || !homes.length) {
            log('获取房间失败');
            ctx.oerror();
            return;
        }

        ctx.body = { success: true, homes, users };
    }

    const connect = async () => {
        const { userid, socketid, udphost, udpport, homeid } = ctx.request.body;

        if (!userid || !socketid || !udpport || !udphost || !homeid) {
            log('参数不完整');
            ctx.oerror();
            return;
        }
        // 判断用户是否存在
        const user = await mysql(
            sql.table(dbuser).where({ id: userid }).select()
        );
        if (!user || !user.length) {
            log('用户不存在');
            ctx.oerror();
            return;
        }
        // 判断房间是否存在
        const home = await mysql(
            sql.table(dbhome).where({ id: homeid }).select()
        );
        if (!home || !home.length) {
            log('房间不存在');
            ctx.oerror();
            return;
        }
        // 保存连接信息
        const otime = Date.now();
        const result = mysql(
            sql.table(dbonline).data({ userid, socketid, udphost, udpport, homeid, otime }).insert()
        );
        if (!result) {
            log('数据保存失败');
            ctx.oerror();
            return;
        }
        // 获取房间聊天记录
        const chats = await mysql(`
            SELECT 
            content,userid,name,photo,type
            FROM ${home[0].chathostroy},${dbuser} 
            WHERE ${home[0].chathostroy}.userid=${dbuser}.id
            ORDER BY time DESC  LIMIT 50
        `);
        if (!chats) {
            log('获取聊天信息失败');
        }
        // socket初始化
        await ctx.udpsend({
            data: { message: { init: true }, socketid },
            host: udphost,
            port: udpport
        });
        // 通知房间其他用户我上线了
        await ctx.udpOnlineSend(homeid, user[0].name, userid);

        ctx.body = { success: true, chats: chats.reverse() || [] };
    }

    const close = async () => {
        const { socketid } = ctx.request.body;
        const result = await mysql(
            sql.table(dbonline).where({ socketid }).delet()
        );
        if (!result) {
            log('删除失败');
            cxt.oerror();
            return;
        }

        ctx.body = { success: true };
    }

    const message = async () => {
        const { homeid, content, userid } = ctx.request.body;
        if(!homeid || !content || !userid) {
            log('确实参数');
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
                type: '1',
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
            type: '1'
        });
        ctx.body = { success: true };
    }

    switch (option) {
        case 'init':
            await init();
            break;
        case 'connect':
            await connect();
            break;
        case 'close':
            await close();
            break;
        case 'message':
            await message();
            break;
    }
}