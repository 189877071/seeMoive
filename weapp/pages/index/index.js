//index.js
// const io = require('../../assets/weapp.socket.io.js');
// const socket = io('wss://socket.jsonhappy.com');
// socket.on('message', data => {
//   console.log(data);
// });
// 在几个页面中需要判断是否登录呢？
// 首先 index，create， 页面说不需要判断登录的
// home，label页面需要判断登录


const app = getApp();

Page({
  data: {
    navs: [
      {
        id: 'tuijian',
        name: '推荐'
      },
      {
        id: 'kongbu',
        name: '恐怖'
      },
      {
        id: 'shenghuo',
        name: '生活'
      },
      {
        id: 'gaoxiao',
        name: '搞笑'
      },
      {
        id: 'donghua',
        name: '动画'
      },
      {
        id: 'diangying',
        name: '电影'
      },
      {
        id: 'yishu',
        name: '艺术'
      },
      {
        id: 'juji',
        name: '剧集'
      }
    ],
    navSelected: 0,
    login: true
  },

  onLoad: function() {
    
  }
})