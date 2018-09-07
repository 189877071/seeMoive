// pages/mi/mi.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    photo: '',
    label: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.login) {
      this.getInfor();
    }

  },

  getInfor() {
    const {
      photo,
      name,
      label
    } = app.globalData.infor.userinfor;

    this.setData({
      photo,
      name,
      label: label || ''
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})