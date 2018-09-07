const https = require('https');

const { appid, secret } = require('./config');

exports.getUserInfor = async function (code) {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    return new Promise(resolve => {
        https
            .get(url, res => {
                let [size, datas] = [0, []];

                res.on('data', data => {
                    size += data.length;
                    datas.push(data);
                });

                res.on('end', () => {
                    const buff = Buffer.concat(datas, size);
                    const result = buff.toString();
                    try{
                        resolve(JSON.parse(result));
                    }
                    catch(e) {
                        resolve(false);
                    }                    
                });
            })
            .on('error', error => {
                resolve(false);
            });
    })
}