import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const gmcp = new Hono();
gmcp.post('/gmcp', zValidator('json', z.object({}).passthrough()), (c) => {
  console.log(JSON.stringify(c.req.json()));
  return c.json({ message: 'Hello!' });
});
