统计Git代码行数
===

```js
const { exec } = require('child_process');
const { argv } = require('yargs');

const readLines = stdout => {
  const stringArray = stdout
    .toString()
    .split(/(\n)/g)
    .filter(str => str !== '\n' && str);
  const dataArray = [];
  stringArray.map(str => {
    const data = str.split(/(\t)/g).filter(str => str !== '\t');
    const [newLine, deletedLine, filePath] = data;
    dataArray.push({ newLine, deletedLine, filePath });
  });
  return dataArray;
};


try {
  if (!argv.commit) throw new Error('')
  exec(`git diff ${argv.commit} --numstat`, (error, stdout, stderr) => {
    console.table(readLines(stdout));
  });
} catch (e) {
  console.log(e);
}
```