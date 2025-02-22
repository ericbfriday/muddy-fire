import { zValidator } from '@hono/zod-validator';
import type { ServerWebSocket } from 'bun';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { basicAuth } from 'hono/basic-auth';
import { createBunWebSocket, serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';

import { createMiddleware } from 'hono/factory';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';

const characterNames: string[] =
  JSON.parse(Bun.env.CHARACTER_NAMES_JSON ?? '[]') ?? ([] as string[]);

console.debug(characterNames);
type Env = {
  Variables: {
    HOSTNAME: string;
    CHARACTER_NAMES_JSON: string[];
  };
};

// https://hono.dev/docs/helpers/websocket
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

// 1. Set the `Env` to `new Hono()`
const app = new Hono<Env>();
// 2. Set the `Env` to `createMiddleware()`
const mw = createMiddleware<Env>(async (c, next) => {
  await next();
});

app.use(mw);
// https://hono.dev/docs/middleware/builtin/secure-headers
app.use(secureHeaders());
// https://hono.dev/docs/middleware/builtin/cors
app.use('/api/*', cors());
app.use(logger());
app.use(prettyJSON());
// app.use(
//   basicAuth({
//     verifyUser: (username, password, c) => {
//       return characterNames.includes(username) && password === 'medievia';
//     },
//   }),
// );

app.use('/static/*', serveStatic({ root: './' }));
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }));
app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.post(
  '/api/name',
  zValidator('json', z.object({ name: z.string() })),
  (c) => {
    const { name } = c.req.valid('json');
    return c.json({ message: `Hello ${name}!` });
  },
);

app.get('/env', (c) => {
  // HOSTNAME is process.env.HOSTNAME on Node.js or Bun
  // HOSTNAME is the value written in `wrangler.toml` on Cloudflare
  const { HOSTNAME } = env<{ HOSTNAME: string }>(c);
  return c.text(HOSTNAME);
});

app.post('/gmcp', zValidator('json', z.object({}).passthrough()), (c) => {
  console.log(JSON.stringify(c.req.json()));
  return c.json({ message: 'Hello!' });
});

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    let intervalRef: Timer | undefined;
    return {
      onMessage(evt, ws) {
        console.debug(evt);
        console.log(`Message from client: ${evt.data}`);
        ws.send('Hello from server!');
      },
      onOpen(evt, ws) {
        console.debug(evt);
        console.log('Connection opened');
        intervalRef = setInterval(() => {
          ws.send('Bun is open!');
        }, 15000);
      },
      onClose: (evt, ws) => {
        console.debug(evt);
        console.log('Connection closed');
        intervalRef?.unref();
      },
      onError(evt, ws) {
        console.debug(evt);
        console.error(`Error: ${evt}`);
        // ws.close();
      },
    };
  }),
);

app.notFound((c) => {
  return c.text('Custom 404 Message', 404);
});
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text('Custom Error Message', 500);
});

export default {
  port: Bun.env.PORT ?? 3000,
  fetch: app.fetch,
  websocket,
};
