// pages/jieshao/jieshao.js
const { showToast } = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: 'https://github.com/189877071/seeMoive'
  },

  copy() {
    wx.setClipboardData({
      data: this.data.url,
      success() {
        showToast('复制成功', 'success')
      }
    })
  }


})