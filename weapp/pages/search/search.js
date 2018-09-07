const { myRequest } = require('../../utils/util.js');

Page({

  data: {
    movies: [],
    inputValue: '',
    isFinish: true
  },

  time: null,

  page: 0,

  count: 0,

  bindKeyInput(event) {
    
    const inputValue = event.detail.value;

    if(inputValue == this.data.inputValue) {
      return;
    }

    this.setData({
      inputValue,
      movies: [],
      isFinish: true
    });

    if(!inputValue) {
      return;
    }

    clearTimeout(this.time);

    wx.showLoading({
      title: '正在加载',
    })

    this.time = setTimeout(() => {
      this.getData(0, inputValue).then(({ success, movies=[], count=0 }) => {
        
        wx.hideLoading();

        if(!success) {
          this.error();
          return;
        }

        for (let i = 0; i < movies.length; i++) {          
          movies[i].name = this.tsName(movies[i].name, inputValue);
        }

        this.setData({
          movies,
          isFinish: count < 2
        });

        this.page = 0;

        this.count = count;
      });
    }, 500);
  },

  getData(page =0, search='') {
    return new Promise(resolve => {
      myRequest('/movie', { page, search }).then(result => resolve(result));
    });
  },

  tsName(name, inputValue) {

    name = name.split(inputValue).map(item => ({
      v: item,
      a: false
    }));

    let len = name.length;

    for (let j = 1; j < len; j += 2) {
      name.splice(j, 0, {
        v: inputValue,
        a: true
      });
      len = name.length;
    }

    return name.filter(item => !!item.v);
  },

  isScrollTolower: false,
  // 上拉
  scrollTolower() {
    if (this.isScrollTolower) {
      return;
    }

    this.isScrollTolower = true;

    const page = this.page + 1;

    if (page >= this.count) {
      this.isScrollTolower = false;
      return;
    }

    this.getData(page, this.data.inputValue).then(({ success, movies = [], count = 0 }) => {
      
      this.isScrollTolower = false;

      if (!success) {
        this.error();
        return;
      }

      for (let i = 0; i < movies.length; i++) {
        movies[i].name = this.tsName(movies[i].name, this.data.inputValue);
      }

      this.setData({
        movies: [].concat(this.data.movies, movies),
        isFinish: (page + 1 >= count)
      });

      this.page = page;

      this.count = count;

    })
  },

  error() {
    wx.showToast({
      title: '数据获取出错',
      icon: 'none'
    });
  },

  clear() {
    this.setData({
      movies: [],
      inputValue: '',
      isFinish: true
    })
  }
})