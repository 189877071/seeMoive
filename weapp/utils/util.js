const { _sessionkey, hostname } = require('./config.js');

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

let sessionid = '';

const myRequest = (url, data = {}) => new Promise(reslove => {

  try {
    sessionid = wx.getStorageSync(_sessionkey);
  } catch (e) { }

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
      catch (e) { }
      reslove(result.data || {});
    },
    fail() {
      reslove({
        success: false,
        error: -1
      });
    }
  })
});

const myUploadFile = (filePath) => new Promise(resolve => {
  wx.uploadFile({
    url: hostname + '/upload',
    filePath: filePath,
    name: 'voice',
    header: {
      'sessionid': sessionid
    },
    success: (result) => {
      let data = {};
      try {
        data = JSON.parse(result.data);
      }
      catch(e) {}
      resolve(data);
    }
  })
})

const showToast = (title, icon = 'none', mask = false) => {
  wx.showToast({
    title,
    icon,
    mask
  });
}

module.exports = {
  formatTime,
  myRequest,
  showToast,
  myUploadFile
}