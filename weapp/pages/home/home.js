// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: 'https://movie-jsonhappy.oss-cn-beijing.aliyuncs.com/movie/video/demo.mp4?OSSAccessKeyId=LTAIwB2w0DcnO8w8&Expires=1536670193&Signature=Ta02EGaHydyDm%2FGt8rWJZb%2F04d0%3D',
    bottom: 0,
    position: 'static',
    voice: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
  },

  binderror() {
    wx.showToast({
      title: '播放出错',
      icon: 'none'
    })
  },

  inputFocus(event) {
    this.setData({
      bottom: event.detail.height,
      position: 'fixed'
    });
  },

  inputBlur() {
    this.setData({
      bottom: 0,
      position: 'static'
    });
  },

  // 切换输入/语音
  showVoice(event) {
    this.setData({
      voice: event.currentTarget.dataset.show == 0
    })
  }
  
})