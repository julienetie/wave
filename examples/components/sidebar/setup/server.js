const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const mimeTypes = require('./mime-types.json');
const generateClientScript = require('./generate-client-script');
const { log } = console;
require('dotenv').config();

const {
	DELAY,
    SERVER_PORT,
    SRC_PATH,
    PREVIEW_MARKUP_DOCUMENT,
    REFRESH_FAVICON_PATH,
    SANDBOX_DOCUMENT,
    RECONNECT_DELAY,
    RECONNECT_TRIES,
    VISIBILITY_ONLY
} = process.env;

// Determine document file.
const documentFile = process.argv.includes('--preview-markup') ?
    PREVIEW_MARKUP_DOCUMENT :
    SANDBOX_DOCUMENT;

const requestListener = (req, res) => {
    let pathname = path.join(__dirname, '../', req.url);

    fs.exists(pathname, (exist) => {
        if (!exist) {
            res.statusCode = 404;
            res.end(`File ${pathname} not found!`);
            return;
        }

        // Get the document at the root
        if (fs.statSync(pathname).isDirectory()) {
            pathname = path.join(pathname, documentFile);
        }

        fs.readFile(pathname, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                const ext = path.parse(pathname).ext;
                res.setHeader('Content-type', mimeTypes[ext] || 'text/plain');

                const sandboxName = path.parse(documentFile).base;
                if (pathname.endsWith(sandboxName)) {
                    const sandboxDocument = data.toString();

                    // Try the closing head tag, then the closing body tag, then EOF if all fails.
                    let bodyClosingTagIndex = sandboxDocument.indexOf('</head>');
                    bodyClosingTagIndex = bodyClosingTagIndex || sandboxDocument.indexOf('</body>');
                    bodyClosingTagIndex = bodyClosingTagIndex || sandboxDocument.length - 1;

                    // Generate and inject the script.
                    const lastPart = sandboxDocument.slice(bodyClosingTagIndex);
                    const firstPart = sandboxDocument.slice(0, bodyClosingTagIndex);
                    const script = generateClientScript(
                    	DELAY,
                    	SERVER_PORT, 
                    	REFRESH_FAVICON_PATH,
                    	RECONNECT_DELAY,
                    	RECONNECT_TRIES,
                    	VISIBILITY_ONLY
                    	);
                    const html = firstPart + script + lastPart;
                    res.end(html);
                    return;
                }
                res.end(data);
            }
        });
    });
}

const server = http.createServer(requestListener);
const ws = new WebSocket.Server({ server });


// Watch files
ws.on('connection', (ws) => {
	const watcher = chokidar.watch(SRC_PATH);
    ws.on('message', (message) => {
    	const data = JSON.parse(message)
    	console.log('message', data);
    });

    const browserAction = `location.reload();`;
    watcher.on('change', path => ws.send(browserAction));
});

server.listen(SERVER_PORT);

console.info(`Watching ${SRC_PATH} on port ${SERVER_PORT} to live-reload ${documentFile}`);