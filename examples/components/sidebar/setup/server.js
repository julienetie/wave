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

// Script Injection
const script = `<script>
	const s = new WebSocket('ws://localhost:4321');
	s.onmessage = e => {
		favicon.href = '/setup/refresh.png';
		document.title = 'Updating';	
		s.send({
			visibilityState: document.visibilityState,
			timestamp: Date.now(), 
			devicePixelRatio
		});
		Function(e.data)();
	}
</script>`;

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

                const sandboxName = path.parse('./document.html').base;
                if (pathname.endsWith(sandboxName)) {
                    const sandboxDocument = data.toString();
                    const bodyClosingTagIndex = sandboxDocument.lastIndexOf('</head>');
                    const lastPart = sandboxDocument.slice(bodyClosingTagIndex);
                    const firstPart = sandboxDocument.slice(0, bodyClosingTagIndex);
                    // console.log('FIRST:',firstPart);
                    // console.log('LAST:',lastPart);
                    const html = firstPart + script + lastPart;
                    res.end(html);
                } else {
                    res.end(data);
                }
            }
        });
    });
}

const server = http.createServer(requestListener);
const ws = new WebSocket.Server({ server });
const watcher = chokidar.watch(SRC_PATH);
ws.on('connection', (ws) => {
    // ws.on('message', (message) => {
    //     //
    // });

    const browserAction = `location.reload();`;
    watcher.on('change', path => ws.send(browserAction));
});

server.listen(SERVER_PORT);

console.info(`Watching ${SRC_PATH} on port ${SERVER_PORT} to live-relad ${SANDBOX_DOCUMENT}`);