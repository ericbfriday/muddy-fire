import { app } from './index';

async function main() {
  const res = await app.request('/ws');
  console.debug(res);
  console.log(JSON.stringify(res));
}

main();
