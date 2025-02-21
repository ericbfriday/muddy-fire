import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";

// https://hono.dev/docs/helpers/websocket
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/", zValidator("json", z.object({ name: z.string() })), (c) => {
  const { name } = c.req.valid("json");
  return c.json({ message: `Hello ${name}!` });
});

app.post("/gmcp", zValidator("json", z.object({})), (c) => {
  console.log(JSON.stringify(c.req.json()));
  return c.json({ message: `Hello!` });
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    let intervalRef: Timer | undefined;
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`);
        ws.send("Hello from server!");
      },
      onOpen(evt, ws) {
        console.log("Connection opened");
        intervalRef = setInterval(() => {
          ws.send("Hello from server!");
        });
      },
      onClose: () => {
        console.log("Connection closed");
        intervalRef?.unref();
      },
    };
  })
);

export default { fetch: app.fetch, websocket };
