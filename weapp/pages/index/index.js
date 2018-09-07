//index.js
// const io = require('../../assets/weapp.socket.io.js');
// const socket = io('wss://socket.jsonhappy.com');
// socket.on('message', data => {
//   console.log(data);
// });
// 在几个页面中需要判断是否登录呢？
// 首先 index，create， 页面说不需要判断登录的
// home，label页面需要判断登录
const {
  myRequest
} = require('../../utils/util.js');

const app = getApp();

Page({

  data: {
    navs: {
      list: [{
        id: 0,
        name: '热门'
      }],
      navSelected: 0
    },
    login: false,
    load: false,
    homes: [],
    navPosition: false,
    isFinish: false
  },

  count: 0,

  page: 0,

  navPosition: false,

  onLoad: function() {
    // 初始化回调
    app.appinitcallback = () => this.init();

    // 如果在初始化之前获取到数据则需要手动执行
    if (app.globalData.init) {
      this.init();
    }
  },

  init: function() {

    const {
      login,
      infor: {
        classify,
        homes,
        count,
        userinfor: {
          label
        }
      }
    } = app.globalData;

    this.setData({
      load: true,
      login,
      homes,
      navs: {
        list: [].concat(this.data.navs.list, classify),
        navSelected: this.data.navs.navSelected
      }
    });

    this.count = count;

    if (login && !label) {
      wx.navigateTo({
        url: '/pages/label/label',
      })
    }
  },

  onPageScroll(event) {
    if (event.scrollTop >= 50 && !this.navPosition) {
      this.navPosition = true;
      this.setData({
        navPosition: true
      })
    } else if (event.scrollTop < 50 && this.navPosition) {
      this.navPosition = false;
      this.setData({
        navPosition: false
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.getHomes(this.data.navs.navSelected, 0).then(({
      homes,
      count
    }) => {

      wx.stopPullDownRefresh();

      this.page = 0;

      this.count = count;

      this.setData({
        homes,
        isFinish: count < 2
      });

      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    })
  },

  isReachBottom: false,

  // 上拉加载
  onReachBottom() {
    if (this.isReachBottom) {
      return;
    }
    
    this.isReachBottom = true;

    const page = this.page + 1;

    if (page >= this.count) {
      this.setData({
        isFinish: true
      });
      this.isReachBottom = false;
      return;
    }

    this.getHomes(this.data.navs.navSelected, page).then(({
      homes,
      count
    }) => {
      this.isReachBottom = false;
      
      this.page = page;
      this.count = count;
      this.setData({
        homes: [].concat(this.data.homes, homes)
      });
    })
  },

  // 获取房间
  getHomes(classify = 0, page = 0) {
    return new Promise(resolve => {
      myRequest('/home', {
        classify,
        page
      }).then(result => resolve(result));
    });
  },

  // 切换导航
  toggleNav(event) {
    const navSelected = Number(event.target.id);

    if (isNaN(navSelected)) {
      return;
    }

    this.page = 0;

    this.count = 0;

    this.setData({
      navs: {
        list: this.data.navs.list,
        navSelected
      },
      homes: [],
      navPosition: false,
      isFinish: true
    });

    wx.showLoading({
      title: '正在加载',
      mask: true
    });

    this.getHomes(navSelected).then(({
      homes,
      count
    }) => {
      wx.hideLoading();

      this.count = count;

      this.setData({
        homes,
        isFinish: count <= 1
      });
    });

  }
})