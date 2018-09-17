const { rename, mkdir, exists, chmod, unlink } = require('fs');
const { log } = require('../common/fn');
const { join } = require('path');
const { staticPath } = require('../common/config');
// 判断文件夹是否存在 如果不存在就创建
const cfDir = (dir) => new Promise(reslove => {
    exists(dir, (onoff) => {
        if (onoff) {
            reslove(true);
            return;
        }
        mkdir(dir, (err) => {
            if (err) {
                log(`${dir}创建文件夹失败`)
                reslove(false);
                return;
            }
            chmod(dir, 0777, (err) => reslove(err ? false : true))
        });
    })
});
// 移动文件
const orename = (file, newfile) => new Promise(reslove => {
    rename(file, newfile, (err) => {
        if(err) {
            log(`移动文件${file}至${newfile}失败`);
        }
        reslove(err ? false : true);
    });
})
// 上传数据
module.exports = async ctx => {

    if(!ctx.req.files || !ctx.req.files['voice']) {
        log('没有接收到上传文件');
        ctx.oerror();
        return;
    }
    
    const { path, type: otype } = ctx.req.files['voice'];

    if(otype != 'audio/mpeg') {
        log('不是音频文件');
        // 删除
        unlink(path, (err) => {
            if(err) {
                log('缓存文件删除失败');
            }
        });
        ctx.oerror();
        return;
    }

    // 获取文件名
    const name = path.split('/').pop();
    
    // 创建文件保存路径
    const t = new Date();

    const uploaPath = `/uploads/${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;

    let dir = join(staticPath, uploaPath);

    const onoff = await cfDir(dir);
    
    if (!onoff) {
        ctx.oerror();
        return;
    }
    // 移动文件
    const rnonof = await orename(path, join(dir, name));

    if (!rnonof) {
        ctx.oerror();
        return;
    }

    ctx.body = { success: true, url: join(uploaPath, name) };
}