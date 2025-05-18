import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import lostItemRoutes from './src/routes/lostItemRoutes.js';

const app = new Hono();

// Routes
app.route('/api/lost-items', lostItemRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Error handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Start server
const port = 3000;
serve({
  fetch: app.fetch,
  port
}, () => {
  console.log(`Server running on port ${port}`);
});