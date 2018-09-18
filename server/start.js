const { join } = require('path');

const { fork } = require('child_process');

start(join(__dirname, 'app.js'));

function start( str) {
    (function fn() {
        let p = fork(str);
        p.on('exit', fn);
    })();
}