const { exec } = require('child_process');
const fs = require('fs');
const { name } = require('../package.json');



const copyFiles = () =>{
	exec(`mkdir -p dist && cp -R src/* dist`, (e, stdout, stderr) => {
	    if (e instanceof Error) {
	        console.error(e);
	        throw e;
	    }
	    nestCSS();
	});
}

copyFiles()