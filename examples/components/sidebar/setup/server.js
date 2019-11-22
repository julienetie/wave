import http from 'http';
import url from 'url';
import fs from 'fs';
import { dirname, join, parse, basename } from 'path';
import WebSocket from 'ws';
import chokidar from 'chokidar';
import mimeTypes from './mime-types.json';
import createDefaultHTML from './create-default-html.js';
import copySRCFiles from './copy-src-files.js';
import generateClientScript from './generate-client-script.js';
import chalk from 'chalk';
import nestCSS from './nest-css.js';
import dotenv from 'dotenv';

const ___dirname = join(dirname(new URL(import.meta.url).pathname));
dotenv.config();

const { yellow } = chalk;
const { log } = console;
const { argv } = process;
const flag = argv[argv.length - 1];
let documentFile;
let distributeComponent = false;
const distPath = './dist';
const {
  DELAY,
  PORT,
  SRC_PATH,
  PREVIEW_MARKUP_DOCUMENT,
  REFRESH_FAVICON_PATH,
  SANDBOX_DOCUMENT,
  RECONNECT_DELAY,
  RECONNECT_TRIES,
  VISIBILITY_ONLY
} = process.env;

switch (flag) {
  case 'preview-markup':
    documentFile = PREVIEW_MARKUP_DOCUMENT;
    break;
  case 'distribute':
    distributeComponent = true;
  default:
    documentFile = SANDBOX_DOCUMENT;
}

const requestListener = (req, res) => {
  let pathname = join(___dirname, '../', req.url);

  fs.exists(pathname, (exist) => {
    if (!exist) {
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    // Get the document at the root
    if (fs.statSync(pathname).isDirectory()) {
      pathname = join(pathname, documentFile);
    }

    fs.readFile(pathname, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        const ext = parse(pathname).ext;
        res.setHeader('Content-type', mimeTypes[ext] || 'text/plain');

        const sandboxName = parse(documentFile).base;
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
            PORT,
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

// Create distribution files.
if (distributeComponent) {
  createDefaultHTML(`http://localhost:${PORT}`)
    .then(({ html }) => {
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath);
      }
      fs.writeFile(`${distPath}/sidebar.html`, html, (err) => {
        if (err) throw err;
        console.log('Created default HTML');
        server.close();
      });
    })
    .then(copySRCFiles);
} else {
  // Watch source files.
  const ws = new WebSocket.Server({ server });
  const watcher = chokidar.watch(SRC_PATH);

  ws.on('connection', (ws) => {
    ws.on('message', (message) => {
      const data = JSON.parse(message)
    });

    const browserAction = `location.reload();`;
    watcher.on('change', (pathName) => {

      const fileName = basename(pathName)
      if (fileName.endsWith('.css')) {
        nestCSS(() => {
          console.log('REFFFFFFFFFFFFFFF')
          ws.send(browserAction)
        });
        return;
      }
      ws.send(browserAction)
    });
  });
}

server.listen(PORT);


console.info(`Watching ${yellow(SRC_PATH)} on port ${yellow(PORT)} to live-reload ${yellow(documentFile)}`);
