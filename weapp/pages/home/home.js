// pages/home/home.js
const io = require('../../assets/weapp.socket.io.js');
const { socketurl, hostname, topurl } = require('../../utils/config.js');

const { showToast, myRequest, myUploadFile } = require('../../utils/util.js');

Page({

  data: {
    src: '',
    bottom: 0,
    position: 'static',
    id: '',
    hostid: '',
    userid: '',
    movieid: '',
    name: '',
    chats: [],
    b: 0,
    progress: 0,
    videoShow: false,
    voiceShow: false,
    currentVoiceBoxShow: false,
    voiceEnd: true,
    voiceTime: 0,
  },

  duration: 0,

  isInit: false,

  id: null,

  option: 'get',

  initcallback({ success, home, chats, userinfor: { username, userid } }) {
    if (!success) {
      showToast('该房间已关闭!');
      setTimeout(() => wx.navigateBack(), 1000);
      return;
    }

    const { file, id, movieid, name, time, hostid } = home;

    const ochats = [].concat(chats, [{ hint: true, content: `“${username}”进入房间~` }]);

    this.setData({
      src: file,
      id,
      movieid,
      hostid,
      userid,
      name,
      inputValue: '',
      chats: ochats,
      b: this.data.b + 1,
      videoShow: true,
      muted: false
    });

    this.isInit = true;

    setTimeout(() => {
      this.videoContext = wx.createVideoContext('myVideo');
      this.videoContext.seek(Math.ceil((Date.now() - time) / 1000));
    }, 30);
  },

  // 播放完毕
  playEnd() {

    this.setData({
      videoShow: false
    });

    if (this.duration - this.currentTime < 30) {
      showToast('以播放完毕~');
      return;
    }

    setTimeout(() => {
      this.setData({
        videoShow: true
      });
    }, 30);

    setTimeout(() => {
      this.videoContext = wx.createVideoContext('myVideo');
      this.videoContext.seek(this.currentTime);
    }, 500);
  },

  // 播放出错
  playError() {
    showToast('播放出错');
  },
  
  currentTime: 0,
  duration: 0,
  // 播放中
  playTimeUpdate({ detail: { duration, currentTime } }) {
    this.duration = duration;
    if (currentTime > this.currentTime) {
      this.currentTime = currentTime;
      this.setData({
        progress: currentTime / duration * 750
      });
    }
  },

  controller: {
    init(data) {
      const { infor: { socketid, udphost, udpport } } = data;
      if (!this.id) {
        showToast('确实必要的id参数');
        setTimeout(() => wx.navigateBack(), 1000);
        return;
      }
      const parameter = { socketid, udphost, udpport, id: this.id, option: this.option };
      myRequest('/home', parameter).then(this.initcallback);
    },
    userexit({ name }) {
      this.setData({
        chats: [].concat(this.data.chats, [{ hint: true, content: `“${name}”离开房间了~` }]),
        b: this.data.b + 1
      });
    },
    online({ name, userid }) {
      // 有人上线了
      if (!this.isInit || userid === this.data.userid) {
        return;
      }
      this.setData({
        chats: [].concat(this.data.chats, [{ hint: true, content: `“${name}”进入房间~` }]),
        b: this.data.b + 1
      });
    },
    message({ name, photo, userid, content, type: otype }) {
      this.setData({
        chats: [].concat(this.data.chats, [{
          name, photo, userid, content, type: otype
        }]),
        b: this.data.b + 1
      })
    }
  },
  // 初始化socket
  socketStart() {
    this.socket = io(socketurl);
    this.socket.on('message', data => {
      this.controller[data.controller] && this.controller[data.controller].call(this, data);
    });
  },

  onLoad: function (options) {
    this.id = options.id;
    this.option = options.option;
    this.socketStart();
    // 获取录音对象
    this.recorderManager = wx.getRecorderManager();
    // 获取录音临时文件地址
    this.recorderManager.onStop(event => {
      this.voiceFilePath = event.tempFilePath;
      if (this.zjsend) this.sendVoice();
    });

    // 获取播放声音对象
    this.innerAudioContext= wx.createInnerAudioContext();
    this.innerAudioContext.onEnded(this.stopVoice);
    this.innerAudioContext.onStop(this.stopVoice);
  },

  onUnload() {
    this.socket && this.socket.close();
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
  // 发送消息
  sendMessage() {
    if (this.data.voiceShow) {
      this.initVoice();
      return;
    }

    if (!this.data.inputValue) {
      showToast('请输入内容');
      return;
    }

    this.messageSubmit(this.data.inputValue, '1').then(({ success }) => {
      if (!success) {
        showToast('消息发送失败');
        return;
      }
      this.setData({ inputValue: '' });
    });
  },
  // 消息证实发送到服务器函数
  messageSubmit(content, otype) {
    return new Promise(resolve => myRequest('/home', { homeid: this.id, content, otype, option: 'message' }).then(resolve));
  },
  // 输入框输入监听
  bindKeyInput(event) {
    this.setData({
      inputValue: event.detail.value
    });
  },
  // 切换输入/语音
  showVoice(event) {
    /**
     * voiceShow 切换 键盘与语音
     * currentVoiceBoxShow 路由提示操作
     * voiceEnd 路由是否完成
     * voiceTime 录音时间
     * muted 是否静音
     * 如果显示 路由提示框时 不能切换回 键盘状态
     * */ 

    if (this.data.currentVoiceBoxShow) {
      return;
    }

    this.setData({
      voiceShow: event.currentTarget.dataset.show == 0,
      bottom: 0,
      position: 'static'
    })
  },
  // 路由定时器对象
  startVoiceTime: null,
  // 初始化录音状态
  initVoice() {
    clearInterval(this.startVoiceTime);

    if (!this.data.voiceEnd) {
      // 正在录音中 停止录音
      this.zjsend = true;
      this.recorderManager.stop();
    }
    this.setData({
      currentVoiceBoxShow: false,
      voiceEnd: true,
      voiceTime: 0,
      muted: false
    });
  },
  zzvoice: false,
  // 开始录音
  startVoice() {
    clearInterval(this.startVoiceTime);
    
    if (this.data.currentVoiceBoxShow) {
      // 停止录音
      this.recorderManager.stop();
      this.setData({ voiceEnd: true, voiceTime: 0, muted: false });
      return;
    }

    // 正在播放语音
    if (this.playVoiceIndex != -1) {
      // 停止播放
      this.innerAudioContext.stop();
      this.zzvoice = true; // 正在录音
    }

    // 进入录音状态
    this.setData({ currentVoiceBoxShow: true, voiceEnd: false, muted: true });

    let num = 0;
    this.startVoiceTime = setInterval(() => {
      // 最大支持 60 秒 超过60秒自动停止录音
      if(num >= 60) {
        showToast('最长支持60秒语音');
        clearInterval(this.startVoiceTime);
        this.startVoice();
        return;
      }
      this.setData({ voiceTime: ++num });
    }, 1000);
    // 开始录音
    this.recorderManager.start({ format: 'mp3', duration: 100000 });
  },
  // 发送语音
  sendVoice() {

    if (this.zjsend) {
      this.zjsend = false;
    }
    else {
      this.initVoice();
    }
    
    if (!this.voiceFilePath) return;

    wx.showLoading({ title: '正在发送语音请稍等', mask: true });

    // 上传语音
    myUploadFile(this.voiceFilePath).then(({ url }) => {

      wx.hideLoading();

      if (!url) {
        showToast('语音上传失败');
        return;
      }

      // 发送消息
      this.messageSubmit(url, '2').then(({ success }) => {
        if (!success) {
          showToast('消息发送失败');
        }
        this.voiceFilePath = '';
      });
    });
  },

  playVoiceIndex: -1,
  // 重新播放
  rePlayVoice: -1,
  // 播放语音
  playVoice(event) {
    const index = event.currentTarget.dataset.index;

    if (!this.data.chats[index]) {
      return;
    }

    if (this.playVoiceIndex == index) {
      // 停止播放当前语音
      this.innerAudioContext.stop();
      return;
    }
    else if (this.playVoiceIndex != -1) {
      // 停止播放当前语音并且播放另一个语音
      this.rePlayVoice = index;
      this.innerAudioContext.stop();
      return;
    }

    this.playVoiceIndex = index;
    this.setVoiceInfor();
  },
  // 播放语音设置
  setVoiceInfor() {
    this.data.chats[this.playVoiceIndex].play = true;
    this.setData({ chats: this.data.chats, muted: true });
    this.innerAudioContext.src = `${topurl}${this.data.chats[this.playVoiceIndex].content}`;
    this.innerAudioContext.play();
  },
  // 语音停止
  stopVoice() {
    this.data.chats[this.playVoiceIndex].play = false;
    this.setData({ chats: this.data.chats, muted: (this.rePlayVoice != -1 || this.zzvoice) });
    if (this.zzvoice) {
      this.zzvoice = false;
    }
    if (this.rePlayVoice != -1) {
      this.playVoiceIndex = this.rePlayVoice;
      this.rePlayVoice = -1;
      this.setVoiceInfor();
    }
    else {
      this.playVoiceIndex = -1;
    }
  }
})
