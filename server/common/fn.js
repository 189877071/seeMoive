const https = require('https');

const oss = require('ali-oss');

const { appid, secret, ossinfor, dev } = require('./config');

const ossStore = oss(ossinfor);
// 获取电影封面地址
exports.getUrl =  function (path) {
    return ossStore.signatureUrl(path, { expires: 3600 }).replace(/^http:/, 'https:');
}

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


exports.log = (str) => {
    if(dev) {
        console.log(str);
    }
}