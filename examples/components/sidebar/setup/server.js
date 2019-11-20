const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const mimeTypes = require('./mime-types.json');
require('dotenv').config();

// Variables
const { SERVER_PORT, SRC_PATH, SANDBOX_DOCUMENT } = process.env;

const requestListener = (req, res) => {
    console.info(`${req.method} ${req.url}`);

    // Get file path
    let pathname = path.join(__dirname, '../', req.url);

    fs.exists(pathname, (exist) => {
        if (!exist) {
            res.statusCode = 404;
            res.end(`File ${pathname} not found!`);
            return;
        }

        // Get the document at the root
        if (fs.statSync(pathname).isDirectory()) {
            pathname = path.join(pathname, SANDBOX_DOCUMENT);
        }

        fs.readFile(pathname, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                const ext = path.parse(pathname).ext;
                res.setHeader('Content-type', mimeTypes[ext] || 'text/plain');
                res.end(data);
            }
        });
    });
}

const server = http.createServer(requestListener);
const ws = new WebSocket.Server({ server });

ws.on('connection', (ws) => {
    ws.on('message', (message) => {
        //
    });

    const watcher = chokidar.watch(SRC_PATH);
    const browserAction = `location.reload();`;
    watcher.on('change', path => ws.send(browserAction));
});

server.listen(SERVER_PORT);

console.info(`Watching ${SRC_PATH} on port ${SERVER_PORT} to live-relad ${SANDBOX_DOCUMENT}`);
