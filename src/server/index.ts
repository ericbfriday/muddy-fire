import { zValidator } from '@hono/zod-validator';
import type { ServerWebSocket } from 'bun';
import { Hono } from 'hono';
import { createBunWebSocket } from 'hono/bun';
import { cors } from 'hono/cors';

import {
  FRONTEND_DEV_URL,
  BACKEND_DEV_URL,
  publishActions,
} from '../shared/constants';
import { MessageFormSchema } from '../shared/types';
import type { Message, DataToSend } from '../shared/types';

const app = new Hono();
app.use('*', cors({ origin: FRONTEND_DEV_URL }));

const { upgradeWebSocket, websocket } = createBunWebSocket();
const server = Bun.serve({
  fetch: app.fetch,
  port: BACKEND_DEV_URL.split(':')[2],
  websocket,
});

const topic = 'anonymous-chat-room';
const messages: Message[] = [];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const messagesRoute = app
  .get('/messages', (c) => {
    return c.json(messages);
  })
  .post(
    '/messages',
    zValidator('form', MessageFormSchema, (result, c) => {
      if (!result.success) {
        return c.json({ ok: false }, 400);
      }
    }),
    async (c) => {
      const param = c.req.valid('form');
      const currentDateTime = new Date();
      const message: Message = {
        id: Number(currentDateTime),
        date: currentDateTime.toLocaleString(),
        ...param,
      };
      const data: DataToSend = {
        action: publishActions.UPDATE_CHAT,
        message: message,
      };

      messages.push(message);
      server.publish(topic, JSON.stringify(data));

      return c.json({ ok: true });
    },
  )
  .delete('/messages/:id', (c) => {
    const messageId = parseInt(c.req.param('id'));
    const index = messages.findIndex((message) => message.id === messageId);

    if (index === -1) {
      return c.json({ ok: false, error: 'Message not found' }, 404);
    }

    const data: DataToSend = {
      action: publishActions.DELETE_CHAT,
      message: messages[index],
    };

    messages.splice(index, 1);
    server.publish(topic, JSON.stringify(data));

    return c.json({ ok: true });
  });

app.get(
  '/ws',
  upgradeWebSocket((_ctx) => ({
    onOpen(_evt, ws) {
      const rawWs = ws.raw as ServerWebSocket;
      rawWs.subscribe(topic);
      console.log(`WebSocket server opened and subscribed to topic '${topic}'`);
    },
    onClose(_evt, ws) {
      const rawWs = ws.raw as ServerWebSocket;
      rawWs.unsubscribe(topic);
      console.log(
        `WebSocket server closed and unsubscribed from topic '${topic}'`,
      );
    },
  })),
);

export default app;
export type AppType = typeof messagesRoute;
