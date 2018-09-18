// components/HomeCard/HomeCard.js
const { myRequest, showToast } = require('../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    homeinfor: Object
  },

  attached() {
    this.setData({
      userlabel: this.getArr(this.properties.homeinfor.userlabel),
      praise: this.properties.homeinfor.praise
    });
  },

  /**
   * 组件的初始数据
   */
  data: {
    userlabel: [],
    praise: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getArr(str) {
      return str.split('/');
    },
    // 点赞
    like(event) {
      const id = event.currentTarget.dataset.id;
      if(!id) return;
      myRequest('/home', { option: 'like', id }).then(({success}) => {
        if(!success) {
          showToast('操作失败');
          return;
        }
        this.setData({
          praise: ++this.data.praise
        })
      })
    }
  },

})