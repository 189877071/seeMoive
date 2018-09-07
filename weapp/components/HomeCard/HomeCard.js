// components/HomeCard/HomeCard.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    homeinfor: Object
  },

  attached() {
    this.setData({
      userlabel: this.getArr(this.properties.homeinfor.userlabel)
    });
  },

  /**
   * 组件的初始数据
   */
  data: {
    userlabel: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getArr(str) {
      return str.split('/');
    }
  },

})