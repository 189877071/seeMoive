const dgram = require('dgram');

const client = dgram.createSocket('udp4');

const { tables: { dbonline, dbuser, dbhome } } = require('./config');

const { log } = require('./fn');

const sql = require('node-transform-mysql');

const mysql = require('./db');

// 获取房间所有信息
const getHomeUsers = async (homeid) => await mysql(
    sql.table(dbonline).where({ homeid }).field('socketid,udphost,udpport').select()
);

// 群发
const massTexting = async (users, message) => {
    let num = 0;

    const cb = async () => {
        if(!users[num]) {
            return;
        }
        const { socketid, udphost, udpport } = users[num];
        num++;
        await udpsend({
            data: { 
                message, 
                socketid 
            },
            host: udphost,
            port: udpport
        });
        await cb();
    }

    await cb();
}

// 群发模版
const massTextingTemplate = async (homeid, message, logstr) => {
    const users = await getHomeUsers(homeid);
    if(!users || !users.length) {
        if(!users) {
            log(logstr);
            return true; // 如果查询出错了，防止删除该房间
        }
        return false;
    }
    await massTexting(users, message);
    return true;
}

// 推送消息
const udpsend = ({ data, host, port }) => new Promise((reslove, reject) => {
    try {
        const message = new Buffer(JSON.stringify(data));
        client.send(message, 0, message.length, port, host, err => reslove(err ? false : true));
    }
    catch (e) {
        reslove(false);
    }
});

// 离线通知
const udpExitSend = async (homeid, name) => {
    const userTo = await massTextingTemplate(homeid, { controller: 'userexit', name }, '离线通知 获取当前房间用户失败');
    if(userTo) {
        return;
    }
    const deletResult = await mysql(sql.table(dbhome).where({ id: homeid }).delet());
    if(!deletResult) {
        log('删除房间失败');
    }
}

// 上线通知
const udpOnlineSend = async (homeid, name, userid) => {
    await massTextingTemplate(homeid, { controller: 'online', name, userid }, '上线通知，获取房间用户数据失败');
}

// 给房间所有人推送消息
const udpHoemSend = async (homeid,message) => {
    await massTextingTemplate(homeid, { controller: 'message', ...message }, '消息推送，获取房间用户数据失败');
}

// 退出
const udpexit = async (msg) => {
    let data = null;

    try {
        data = JSON.parse(msg.toString());
    }
    catch (e) { }

    if (!data) return;

    const { socketid } = data;

    if (!socketid) return;

    // 先判断socketid是否存在
    const isOnLine = await mysql(sql.table(dbonline).where({ socketid }).select());

    if (!isOnLine || !isOnLine.length) {
        return;
    }
    
    // 删除用户登录数据
    await mysql(sql.table(dbonline).where({ socketid }).delet());

    // 获取用户信息
    const user = await mysql(
        sql.table(dbuser).where({ id: isOnLine[0].userid }).field('name').select()
    );
    
    if(!user || !user.length) {
        log('用户退出,获取用户数据失败');
        return;
    }

    // 通知他们当前用户下线了
    await udpExitSend(isOnLine[0].homeid, user[0].name);

    

    return true;
}

client.on('message', udpexit);

module.exports = async (ctx, next) => {
    ctx.oerror = (error = 0) => ctx.body = ({ error, success: false });
    ctx.udpsend = udpsend;
    ctx.udpexit = udpexit;
    ctx.udpOnlineSend = udpOnlineSend;
    ctx.udpExitSend = udpExitSend;
    ctx.udpHoemSend = udpHoemSend;
    await next();
}