const {
  myRequest
} = require('../../utils/util.js');

const app = getApp();

// components/Login/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    send: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(e) {
      this.setData({
        send: true
      });
      wx.login({
        success: (res) => {
          myRequest('/signin', { ...e.detail.userInfo,
            code: res.code
          }).then(result => {
            
            const {
              success,
              classify,
              homes,
              count
            } = result;

            if (success) {
              app.globalData.init = true;

              app.globalData.login = !!success;

              app.globalData.infor = {
                classify,
                homes,
                count
              };

              app.appinitcallback && app.appinitcallback();
            } else {
              wx.showToast({
                title: '请求失败',
                icon: 'none',
                duration: 2000,
                mask: true
              });
              this.setData({
                send: false
              });
            }
          })
        }
      })
    }
  },
  created() {
    wx.hideTabBar();
  },
  detached() {
    wx.showTabBar();
  }
})