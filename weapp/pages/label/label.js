// pages/label/label.js

const { myRequest } = require('../../utils/util.js');

const app = getApp();

Page({

  data: {
    list: ['女装大佬', '老司机', '抠脚大汉', '小哥哥', '暖男', '直男', '怪蜀黍', '钢铁直男', '爱健身', '戏精','内向','铲屎官', '死宅', '中二病', '游戏迷', '单身狗', '逗比', '高冷', '吃货', '重口味', 'coser', '有毒慎聊', '学渣', '佛系青年','颜控', '话痨', '声控', '失眠星人'],
    labels: [],
    inputValue: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.infor) {
      const { label } = app.globalData.infor.userinfor;
      
      if(label) {
        this.setData({
          labels: label.split('/')
        })
      }

    }
    
  },

  toast() {
    wx.showToast({
      title: '最多只能选择 5 个标签',
      icon: 'none'
    });
  },

  // 添加标签
  addLabel(event) {

    const item = event.currentTarget.dataset.item;

    if (!item) {
      return;
    }

    const index = this.data.labels.indexOf(item);

    if (index > -1) {
      this.data.labels.splice(index, 1);
      this.setData({
        labels: [].concat(this.data.labels)
      });
      return;
    }

    if(this.data.labels.length >= 5) {
      this.toast();
      return;
    }
    
    this.setData({
      labels: [].concat(this.data.labels, [item])
    });
  },

  createValue() {
    this.setData({
      inputValue: ''
    });
  },

  // 添加列表
  addList() {
    const item = this.data.inputValue;

    if(!item) {
      return;
    }

    if (this.data.labels.length >= 5) {
      this.toast();
      this.createValue();
      return;
    }

    // 判断是否输入是相同的标签，如果相同清除数组内部的标签再添加;
    // 如果不是相同标签则剔除一个没有选中的标签;
    const index = this.data.list.indexOf(item);
    if (index > -1) {
      this.data.list.splice(index, 1);
    }
    else {
      for (let i=this.data.list.length -1; i > 0; i--) {
        const item = this.data.list[i];
        if (this.data.labels.indexOf(item) == -1) {
          const a = this.data.list.splice(i, 1);
          break;
        }
      }
    }

    this.setData({
      list: [].concat([item], this.data.list),
      inputValue: '',
      labels: [].concat(this.data.labels, [item])
    });

  },

  bindKeyInput(event) {
    this.setData({
      inputValue: event.detail.value
    });
  },

  // 保存
  save() {
    if(!this.data.labels.length) {
      wx.showToast({
        title: '请选择至少一个标签',
        icon: 'none'
      })
      return;
    }

    wx.showLoading({
      title: '正在上传数据',
      mask: true
    });

    const label = this.data.labels.join('/');
    
    myRequest('/setinfor', { label }).then(({ success }) => {
      wx.hideLoading();
      wx.showToast({
        title: success ? '设置成功' : '设置失败',
        icon: success ? 'success' : 'none' 
      });
      app.globalData.infor.userinfor.label = label;
    })
  }
})