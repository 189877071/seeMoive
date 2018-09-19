# 微信小程序
## 名称：观影聊天室

#### 我这段时间准备面试，很多公司要求提供小程序作品。我之前没写过小程序，准备花几天时间学习一番，由于刚刚接触小程序，对小程序的规则不是很熟悉，所以导致该作品无法通过审核，只能在此通过图片展示一下了。

#### 特色：看电影同时可以一起聊天，观影室的视频播放时间是同步的，聊天方式可以选择语音与文字两种方式。

#### ps：模仿微观app的创意。

#### 该程序一共做了7个页面，其实还准备写一个观看历史页面，我没来得及实现它，现在也懒得弄了。

## 遇到的问题：
#### 视频播放一段时间后直接跳到结尾播放完毕，这应该是小程序框架本身的一个bug，因为我发现它只会缓存加载一会后便不继续加载。
#### 解决方法：监听 bindtimeupdate事件 获取到当前播放时间， 监听 bindended事件，在触发bindended事件的时候判断播放点是否与视频长度一致，如果不一致则重新渲染视频标签，再把播放进度拉到当前播放点。
#### 代码：
![code](https://socketv2.jsonhappy.com/jietu/code1.jpg "code")
![code](https://socketv2.jsonhappy.com/jietu/code2.jpg "code")


# 安装方式

`git clone git@github.com:189877071/seeMoive.git`

`把 server 文件上传到文件夹`

`下载sql表：https://socketv2.jsonhappy.com/jietu/sql.txt`

`根据sql表创建好数据库`

`websocket通信部分，在小程序设置 “websocket.jsonhappy.com”，你需要开启服务器所有端口才能通信`

`你也可以通过“https://github.com/189877071/webckat-moblie/blob/master/server/socket/start.js”自己实现，如果不懂可以联系我 qq 189877071`

# 首页

![首页](https://socketv2.jsonhappy.com/jietu/index.jpg "首页")

# 创建房间
![创建房间](https://socketv2.jsonhappy.com/jietu/create.jpg "创建房间")

# 搜索

![搜索](https://socketv2.jsonhappy.com/jietu/search.jpg "搜索")

# 我

![我](https://socketv2.jsonhappy.com/jietu/mi.jpg "我")


# 我的标签

![我的标签](https://socketv2.jsonhappy.com/jietu/label.jpg "我的标签")

# 介绍

![介绍](https://socketv2.jsonhappy.com/jietu/js.jpg "介绍")

# 观影室

![房间聊天室](https://socketv2.jsonhappy.com/jietu/home.jpg "房间聊天室")

![审核结果](https://socketv2.jsonhappy.com/jietu/tz.jpg "审核结果")