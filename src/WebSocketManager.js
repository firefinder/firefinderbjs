const GeneralLog = require("../util/Logger");
const ws = require('ws');
const http = require('http')

class WebSocketManager extends GeneralLog {
    constructor(port, express) {
        super('minimal', false);
        this.port = port;
        this.express = express;
        this.server = http.createServer(this.express);
        this.wss = new ws.Server({ server });
    }

    emit(message, location) {
        if(!location) return console.log(this.errorLog('No clients provided on emit request.', 'ws'));
        if(!message) return console.log(this.errorLog('No message provided on emit request.', 'ws'));
        console.log(this.wss.clients)
        return;
    }
}

module.exports = WebSocketManager;
