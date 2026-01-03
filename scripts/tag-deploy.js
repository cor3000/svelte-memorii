const { execFileSync } = require('child_process');

const pad = (value) => String(value).padStart(2, '0');
const now = new Date();
const tag = [
  'deploy-',
  now.getFullYear(),
  pad(now.getMonth() + 1),
  pad(now.getDate()),
  '-',
  pad(now.getHours()),
  pad(now.getMinutes()),
  pad(now.getSeconds())
].join('');

execFileSync('git', ['tag', tag], { stdio: 'inherit' });
console.log(`Created git tag ${tag}`);
