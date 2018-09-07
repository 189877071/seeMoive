// pages/create/create.js

const app = getApp();

const { myRequest } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navs: {
      list: [{
        id: '0',
        name: '最新'
      }],
      navSelected: 0
    },
    isFinish: false,
    load: false,
    movies: []
  },

  page: 0,

  count: 0,

  isScrollTolower: false,

  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    // 判断是否登录
    if (!app.globalData.login) {
      wx.switchTab({
        url: '/pages/index/index',
      });
    }
  },

  onLoad: function(options) {
    // 先获取数据
    this.getData().then(({ success, movies = [], count = 0 }) => {

      this.setData({
        load: true,
        navs: {
          list: [].concat(this.data.navs.list, app.globalData.infor.classify),
          navSelected: 0
        },
        movies: movies || []
      });

      if (!success) {
        wx.showToast({
          title: '数据获取失败',
          icon: 'none'
        })
        return;
      }

      this.count = count;
    })
  },

  // 上拉加载
  scrollTolower() {
    if (this.isScrollTolower) {
      return;
    }

    this.isScrollTolower = true;

    const page = this.page + 1;
    
    if(page >= this.count) {
      this.isScrollTolower = false;
      return;
    }
  
    this.getData(page, this.data.navs.navSelected).then(({ success, movies=[], count=0 }) => {
      
      this.isScrollTolower = false;

      if(!success) {
        wx.showToast({
          title: '数据获取失败',
          icon: 'none'
        });
        return;
      }
     
      this.setData({
        movies: [].concat(this.data.movies, movies),
        isFinish: (page + 1 >= count)
      });

      this.page = page;

      this.count = count;
    });
  },

  // 获取数据
  getData(page = 0, classify=0) {
    return new Promise(resolve => {
      myRequest('/movie', { page, classify }).then(result => resolve(result));
    })
  },

  // 切换分类
  toggleNav(event) {

    const id = Number(event.currentTarget.dataset.id);

    if(isNaN(id)) {
      return;
    }

    wx.showLoading({
      title: '正在获取数据',
      mask: true
    });
    
    let navs = this.data.navs;

    navs.navSelected = id;

    this.setData({
      movies: [],
      navs,
      isFinish: true
    });

    this.page = 0;

    this.count = 0;

    this.getData(0, id).then(({ success, movies =[], count = 0 }) => {
      wx.hideLoading();

      if(!success) {
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
        return;
      }

      this.setData({
        movies,
        isFinish: (count < 2)
      });
  
      this.count = count;
    });

  }

})