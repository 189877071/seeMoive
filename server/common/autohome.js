const mysql = require('./db');
const sql = require('node-transform-mysql');
const uuid = require('uuid');
const oss = require('ali-oss');
const { tables: { dbhome, dbonline, dbuser, dbmovie } } = require('./config');
const { getUrl, log } = require('./fn');

let [users, onlineUser, movieCount, num, rnum, homes] = [[], [], 0, 0, 0, []];

// 获取到所有系统创建的用户
async function getAutoUsers() {
    const users = await mysql(
        sql.table(dbuser).where({ demo: '2' }).field('id').select()
    );
    
    log((users && users.length) ? `获取到了所有人用户数据,数量为：${users.length}` : '没有获取到系统创建的用户');

    return (users && users.length) ? users : [];
}

// 获取电影的数量
async function getMoiveCount() {
    const count = await mysql(
        sql.count().table(dbmovie).select()
    );
    
    log((count && count.length && count[0]['COUNT(1)']) ? `成功获取到电影数量，总数为：${count[0]['COUNT(1)']}`: '获取电影数量失败');

    return (count && count.length && count[0]['COUNT(1)']) ? count[0]['COUNT(1)'] : 0;
}

// 获取到一个电影id
async function getMovieId() {
    // 获取随机值
    const num = Math.floor(Math.random() * movieCount);

    const movie = await mysql(
        sql.table(dbmovie).limit(num, 1).field(['classid', 'id']).select()
    );
    
    if (!movie || !movie.length) {
        log('获取电影数据失败');
    }

    return (movie && movie.length) ? movie[0] : false;
}

// 创建房间相关联的房间表
async function createChatTable(name) {
    const sql = `
    CREATE TABLE ${name} (
        userid VARCHAR(255) NOT NULL,
        content TEXT,
        type ENUM('1', '2') DEFAULT 1,
        time bigint(20) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `;
    const result = await mysql(sql);

    if (!result) {
        log(`创建${name}表失败`);
    }
}

// 设置用户在线
async function setUserOnLine(userid, homeid) {
    const sqlstr = sql.table(dbonline).data({
        userid,
        socketid: uuid(),
        udphost: '127.0.0.1',
        udpport: 5000,
        homeid,
        otime: Date.now()
    }).insert();

    const result = await mysql(sqlstr);

    if (!result) {
        log(`添加数据${userid}上线,操作失败`);
    }
}

// 创建房间
async function createHome(userid) {
    log('准备创建一个房间，用户id为：' + userid);
    // 获取电影id
    const movie = await getMovieId();

    if (!movie) {
        return;
    }

    // 聊天表名称
    const chathostroy = `movie_chat_${uuid().replace(/-/g, '')}`;
    // 房间id
    const id = uuid();
    // 添加房间
    const homeResult = await mysql(
        sql.table(dbhome).data({
            id,
            userid,
            movieid: movie['id'],
            classify: movie['classid'],
            auto: '2',
            time: Date.now(),
            chathostroy,
            pv: Math.floor(Math.random() * 1000),
            praise: Math.floor(Math.random() * 99)
        }).insert()
    );

    if (!homeResult) {
        log('创建房间失败');
    }

    if (!homeResult) {
        return;
    }

    // 创建聊天表
    await createChatTable(chathostroy);

    // 上线
    await setUserOnLine(userid, id);
}

async function setUserHome() {
    if (!users[num]) {
        log('创建房间操作完毕!');
        num = 0;
        return;
    }

    const id = users[num].id;

    num++;

    if (onlineUser.includes(id)) {
        log(`用户id:${id}已存在`);
        await setUserHome();
        return;
    }

    onlineUser.push(id);

    await createHome(id);

    await setUserHome();
}

// 清除系统自带房间
async function deleteHome({ id, chathostroy }) {
    // 判断是否有其他用户在房间观影
    const homeusers = await mysql(
        sql.table(dbonline).where({ homeid: id }).select()
    );
    if (homeusers && homeusers.length > 1) {
        return;
    }

    // 删除房间
    const delhomeres = await mysql(
        sql.table(dbhome).where({ id }).delet()
    );

    log(!delhomeres ? `删除房间:${id}失败` : `成功删除房间${id}`);

    if (!delhomeres) {
        return;
    }

    // 删除房间指定的表
    const delchatres = await mysql(`DROP TABLE ${chathostroy}`);
    log(`删除房间${id}对应的聊天表,删除失败`);

    // 删除此房间内在线表用户
    const delonline = await mysql(
        sql.table(dbonline).where({ homeid: id }).delet()
    );
    if (!delonline) {
        log('删除在线用户id：${id}失败');
    }

    if (!homeusers.length) {
        log(`${id}房间没有找到在线用户`);
        return;
    }

    const index = onlineUser.indexOf(homeusers[0].userid);
    if (index > -1) {
        const uid = onlineUser.splice(index, 1);
        log(`清除在线id：${uid}`);
    }
    else {
        log(`没有匹配上用户id${homeusers[0].userid}`);
    }
}

// 获取到所有系统创建的房间
async function getAutoHomes() {
    const homes = await mysql(
        sql.table(dbhome).where({ auto: '2' }).field(['id', 'chathostroy']).select()
    );
    return homes || [];
}

// 删除房间
async function deleteHomes() {
    if (!homes[rnum]) {
        rnum = 0;
        return;
    }
    await deleteHome(homes[rnum]);

    rnum++;

    await deleteHomes();
}

// 获取所有电影
async function getMovie() {
    const movies = await mysql(
        sql.table(dbmovie).field(['coverx', 'coverm', 'coverl', 'id']).select()
    );
    if (!movies || !movies.length) {
        log('没有获取到电影数据');
    }
    return movies || [];
}


async function movietihuan({ coverx, coverm, coverl, id }) {
    const result = await mysql(
        sql.table(dbmovie).data({
            urlx: getUrl(coverx),
            urlm: getUrl(coverm),
            urll: getUrl(coverl),
        }).where({ id }).update()
    );
    log(`电影${id}封面修改${result ? '成功' : '失败'}`);
}

// 更改所有电影封面
async function reMoviePhoto() {
    const movies = await getMovie();

    let num = 0;

    const traversal = async () => {
        if (!movies[num]) {
            num = 0;
            return;
        }
        await movietihuan(movies[num]);
        num++;
        await traversal();
    }

    await traversal();
}

// 启动
module.exports = async function () {
    // 获取所有系统创建房间
    homes = await getAutoHomes();
    // 删除所有系统创建房间
    await deleteHomes();
    // 获取到用户
    if (!users.length) {
        users = await getAutoUsers();
    }
    // 获取到电影数量
    if (!movieCount) {
        movieCount = await getMoiveCount();
    }
    // 创建房间
    await setUserHome();
    // 更改电影图片地址
    await reMoviePhoto();
}