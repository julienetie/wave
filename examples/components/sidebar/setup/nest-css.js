const fs = require('fs');
const postcss = require('postcss');
const postcssNesting = require('postcss-nesting');
const exec = require('child_process').exec;

const writeCSS = (callback) => fs.readFile("./src/style.css", (err, CSS) => {
    postcss([
            postcssNesting()
        ]).process(CSS, { from: "./src/style.css", to: "./temp/style.css" })
        .then((result) => {
            fs.writeFile("./temp/style.css", result.css, callback);
        });
})

const nestCSS = (callback) => {
    exec(`mkdir -p temp`, (e, stdout, stderr) => {
        if (e instanceof Error) {
            console.error(e);
            throw e;
        }
        console.log('Make dir done')
        writeCSS(callback);
    });
    return;
}
module.exports = nestCSS;