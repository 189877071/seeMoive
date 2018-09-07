const { _sessionkey, hostname} = require('./config.js');

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const myRequest = (url, data = {}) => new Promise(reslove => {
  

  let sessionid = '';

  try {
    sessionid = wx.getStorageSync(_sessionkey);
  } catch (e) {}

  wx.request({
    url: hostname + url,
    data,
    header: {
      'content-type': 'application/json', // 默认值
      'sessionid': sessionid
    },
    method: "POST",
    success(result) {
      try {
        wx.setStorageSync(_sessionkey, result.data._sessionid);
      }
      catch(e) {}
      reslove(result.data || {});
    },
    fail() {
      reslove({
        success: false,
        error: -1
      });
    }
  })
})

module.exports = {
  formatTime: formatTime,
  myRequest
}