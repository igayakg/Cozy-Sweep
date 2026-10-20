// A dependency-free local server. Game logic runs in public/js/game.js.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const publicDirectory = path.resolve(__dirname, '../public');
const port = Number(process.env.PORT || 3000);
// Use HOST=0.0.0.0 to play from another device on your Wi-Fi.
const host = process.env.HOST || '127.0.0.1';
const routes = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/css/styles.css', ['css/styles.css', 'text/css; charset=utf-8']],
  ['/js/game.js', ['js/game.js', 'text/javascript; charset=utf-8']],
]);

const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }

  // An explicit allowlist prevents serving backend files or arbitrary paths.
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const route = routes.get(pathname);
  if (!route) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  try {
    const [filename, contentType] = route;
    const content = await fs.readFile(path.join(publicDirectory, filename));
    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    console.error('Unable to serve game file:', error.message);
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Unable to load the game');
  }
});

server.on('error', (error) => {
  console.error('Server error:', error.message);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Cozy Sweep is ready at http://${host}:${port}`);
  console.log('Press Ctrl+C to stop.');
});
