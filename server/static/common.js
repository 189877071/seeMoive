var userid, socketid, udphost, udpport, homeid, connectState;

function $(id) {
    return document.querySelector(id);
}

function removeClass(list) {
    for (var i = 0; i < list.length; i++) {
        list[i].className = '';
    }
}

function ajax(url, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        callback(xhr.response);
    }
    xhr.send(JSON.stringify(data));
}

function getHTML(list) {
    var str = '';
    for (var i = 0; i < list.length; i++) {
        str += '<li data-id="' + list[i]['id'] + '">' + list[i]['name'] + '</li>';
    }
    return str;
}

function init(userList, homesLsit) {
    var user = $('#users');
    var home = $('#homes');
    var activeUser = $('#activeUser');
    var activeHome = $('#activeHome');

    user.innerHTML = getHTML(userList);

    home.innerHTML = getHTML(homesLsit);

    var users = user.querySelectorAll('li');
    var homes = home.querySelectorAll('li');

    for (var i = 0; i < users.length; i++) {
        users[i].onclick = function () {
            removeClass(users);
            this.className = 'selected';
            userid = this.dataset.id;
            activeUser.innerHTML = this.innerHTML;
        }
    }

    for (var i = 0; i < homes.length; i++) {
        homes[i].onclick = function () {
            removeClass(homes);
            this.className = 'selected';
            activeHome.innerHTML = this.innerHTML;
            homeid = this.dataset.id;
        }
    }
}

// 断开
function close() {
    ajax('/api/test', { option: 'close', socketid: socketid }, function (data) {
        if (!data || !data.success) {
            alert('操作失败');
            return;
        }
        stateDom('未连接', '#f00', '连接', false);
    })
}

function stateDom(state, color, val, onoff) {
    var ostate = $('#state'),
        btn = $('#connect');
    ostate.innerHTML = state;
    ostate.style.color = color;
    btn.innerHTML = val;
    connectState = onoff;
}

// 连接
function connect() {
    if (connectState) {
        location.reload();
        return;
    }

    if (!homeid || !userid) {
        alert('没有选中用户或房间');
        return;
    }
    if (!socketid || !udphost || !udpport) {
        alert('socket没有完成初始化');
        return;
    }
    // 连接
    ajax('/api/test', { userid: userid, socketid: socketid, udphost: udphost, udpport: udpport, homeid: homeid, option: 'connect' }, function (data) {
        if (!data || !data.success) {
            alert('连接失败，请重新尝试');
            return;
        }
        stateDom('连接成功', '#1ccd6f', '断开', true);
        data.chats.forEach(function(item) {
            addMessage(item);
        });
    })
}

// 发送消息
function sendMessage() {
    var content = $('#editor').value;

    if (!content) {
        alert('没有输入内容');
        return;
    }
    if (!connectState) {
        alert('请先连接房间');
        return;
    }
    ajax('/api/test', { option: 'message', userid: userid, homeid: homeid, content: content }, function (data) {
        if (!data || !data.success) {
            alert('发送失败');
            return;
        }
        $('#editor').value = '';
    })
}

// 添加消息
function addMessage(data) {
    var obox = $('#chatList'),
        oBoxParent = obox.parentNode;

    addMessage = function (data) {
        var content = data.content,
            name = data.name,
            photo = data.photo,
            id = data.userid;
        var oli = document.createElement('li');

        if (userid == id) {
            oli.className = 'mi';
        }

        var oimg = document.createElement('img');
        oimg.src = photo;

        var odiv = document.createElement('div');
        odiv.className = 'ct';

        var oname = document.createElement('div');
        oname.className = 'name';
        oname.innerHTML = name;

        var ocontent = document.createElement('div');
        ocontent.className = 'content';
        ocontent.innerHTML = content;

        odiv.appendChild(oname);
        odiv.appendChild(ocontent);

        oli.appendChild(oimg);

        oli.appendChild(odiv);

        obox.appendChild(oli);

        var top = obox.scrollHeight - oBoxParent.clientHeight;

        if (top < 0) top = 0;

        oBoxParent.scrollTop = top;
    }
    addMessage(data);
}

var socketController = {
    init: function (data) {
        console.log(data);
        socketid = data.infor.socketid;
        udphost = data.infor.udphost;
        udpport = data.infor.udpport;
    },
    online: function (data) {
        console.log(data);
    },
    userexit: function (data) {
        console.log(data);
    },
    message: function (data) {
        console.log(data)
        addMessage(data);
    }
}

window.onload = function () {

    socket = io('https://socket.jsonhappy.com');

    $('#connect').onclick = connect;

    $('#send').onclick = sendMessage;

    socket.on('message', function (data) {
        socketController[data.controller] && socketController[data.controller](data);
    });

    ajax('/api/test', { option: 'init' }, function (data) {
        if (!data || !data.success) {
            alert('初始化失败');
            return;
        }
        console.log(data)

        var homes = data.homes;
        var users = data.users;
        init(users, homes)
    });
}
