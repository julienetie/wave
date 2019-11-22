import fs from 'fs';
import postcss from 'postcss';
import postcssNesting from 'postcss-nesting';
import { exec } from 'child_process';

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
    console.log('Make dir done');
    if (typeof callback === 'function')
      writeCSS(callback);
  });
  return;
}

export default nestCSS;