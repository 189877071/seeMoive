const Router = require('koa-router');
const https = require('https');

const { appid, secret } = require('../common/config');

const WXBizDataCrypt = require('../common/WXBizDataCrypt');

const router = new Router({
    prefix: '/api'
});

async function getUserInfor(code) {
    return new Promise(reslove => {

        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

        https.get(url, res => {

            let [size, datas] = [0, []];

            res.on('data', data => {
                size += data.length;
                datas.push(data);
            });

            res.on('end', () => {
                const buff = Buffer.concat(datas, size);
                const result = buff.toString();

                var pc = new WXBizDataCrypt(appId, sessionKey);

                var data = pc.decryptData(encryptedData , iv);
                console.log(result);
                reslove(true);
            });

        }).on('error', error => {
            console.log(error);
            reslove(false);
        });
    })
}

router.post('/login', async (ctx) => {

    const { code } = ctx.request.body;

    if (!code) {
        ctx.body = { error: true };
        return;
    }

    const result = await getUserInfor(code);

    res.body = { success: !!result };
});

module.exports = router;