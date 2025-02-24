import { zValidator } from '@hono/zod-validator';
import type { ServerWebSocket } from 'bun';
import { Hono } from 'hono';
// import { env } from 'hono/adapter';
import { createBunWebSocket, serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';

import { createMiddleware } from 'hono/factory';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
// import { secureHeaders } from 'hono/secure-headers';
import type { WSEvents } from 'hono/ws';
import { z } from 'zod';
import { GMCPSchema } from './medievia/gmcp-schemas';

const characterNames: string[] =
  JSON.parse(Bun.env.CHARACTER_NAMES_JSON ?? '[]') ?? ([] as string[]);

console.debug(characterNames);
type Env = {
  Variables: {
    HOSTNAME: string;
    CHARACTER_NAMES_JSON: string[];
  };
};

// 1. Set the `Env` to `new Hono()`
export const app = new Hono<Env>();
// 2. Set the `Env` to `createMiddleware()`
// const mw = createMiddleware<Env>(async (c, next) => {
//   await next();
// });

// app.use(mw);
// https://hono.dev/docs/helpers/websocket
const { upgradeWebSocket, websocket } =
  createBunWebSocket<ServerWebSocket<Env>>();

// https://hono.dev/docs/middleware/builtin/secure-headers
// app.use(secureHeaders());
// https://hono.dev/docs/middleware/builtin/cors
app.use('/api/*', cors());
app.use(logger());
app.use(prettyJSON({ space: 2 }));
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

app.get(
  '/ws',
  upgradeWebSocket(() => {
    // let intervalRef: Timer | undefined;
    return {
      onMessage(event, ws) {
        console.log(JSON.stringify(event));
        console.log(`Message from client: ${event.data}`);
        ws.send('Hello from server!');
      },
      onClose: () => {
        console.log('Connection closed');
      },
      // onMessage(evt, ws) {
      //   console.debug(evt);
      //   console.log(`Message from client: ${evt.data}`);
      //   ws.send('Hello from server!');
      // },
      // onOpen(evt, ws) {
      //   console.debug(evt);
      //   console.log('Connection opened');
      //   intervalRef = setInterval(() => {
      //     ws.send(new Date().toISOString());
      //   }, 15000);
      // },
      // onClose: (evt, ws) => {
      //   console.debug(evt);
      //   console.log('Connection closed');
      //   clearInterval(intervalRef);
      // },
      // onError(evt, ws) {
      //   console.debug(evt);
      //   console.error(`Error: ${evt}`);
      //   ws.close();
      // },
    } satisfies WSEvents<ServerWebSocket<Env>>;
  }),
);

app.notFound((c) => {
  return c.text('Custom 404 Message', 404);
});
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text('Custom Error Message', 500);
});

app.post(
  '/api/name',
  zValidator('json', z.object({ name: z.string() })),
  (c) => {
    const { name } = c.req.valid('json');
    return c.json({ message: `Hello ${name}!` });
  },
);

app.post('/gmcp', (c) => {
  const body = c.req.json();
  // zValidator('json', GMCPSchema.passthrough()),
  console.log(JSON.stringify(c.req.json()));
  return c.json({ message: 'Hello!' });
});

export default {
  port: Bun.env.PORT ?? 3000,
  fetch: app.fetch,
  websocket,
};
