const {
  myRequest
} = require('./utils/util.js');

App({
  onLaunch: function() {
    wx.hideTabBar();

    wx.login({
      success: (res) => {
        myRequest('/login', {
          code: res.code
        }).then(result => {
          console.log(result);

          const {
            success,
            classify,
            homes,
            count,
            userinfor
          } = result;

          if (success) {
            wx.showTabBar();
          }

          this.globalData.init = true;

          this.globalData.login = !!success;

          this.globalData.infor = {
            classify,
            homes,
            count,
            userinfor
          }

          if (this.appinitcallback) {
            this.appinitcallback();
          }
        })
      }
    })
  },

  globalData: {
    init: false,
  }
})