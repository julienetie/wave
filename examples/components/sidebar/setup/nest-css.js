const fs = require('fs');
const postcss = require('postcss');
const postcssNesting = require('postcss-nesting');

const nestCSS = () => {
    fs.readFile("./src/style.css", (err, CSS) => {
        const results = postcss([
                postcssNesting()
            ]).process(CSS, { from: "./src/style.css", to: "./dist/style.css" })
            .then((result) => {
                fs.writeFile("./dist/style.css", result.css, () => true)
            });
    })
}
module.exports = nestCSS;