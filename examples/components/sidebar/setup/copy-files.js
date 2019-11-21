const exec = require('child_process').exec;
const fs = require('fs');
const { name } = require('../package.json');
const postcss = require('postcss');
const postcssNesting = require('postcss-nesting');
const nestCSS = require('./nest-css.js')

exec(`mkdir -p dist && cp -R src/* dist`, (e, stdout, stderr) => {
    if (e instanceof Error) {
        console.error(e);
        throw e;
    }
    nestCSS();
});



