//index.js
const io = require('../../assets/weapp.socket.io.js');

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
    navSelected: 0
  },

  onLoad: function() {
    // const socket = io('wss://socket.jsonhappy.com');

    // socket.on('message', data => {
    //   console.log(data);
    // });

  }
})