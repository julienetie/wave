import { exec } from 'child_process';
import packageJSON from '../package.json';
const { name } = packageJSON;

const copyFiles = () => {
  exec(`mkdir -p dist && cp -R src/* dist`, (e, stdout, stderr) => {
    if (e instanceof Error) {
      console.error(e);
      throw e;
    }
  });
}

export default copyFiles;
