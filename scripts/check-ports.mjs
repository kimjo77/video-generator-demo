import { createServer } from 'node:net';
const ports = process.argv.slice(2).map(Number);
for (const port of ports) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', () =>
      reject(
        new Error(`Port ${port} is unavailable. Stop the existing process before starting Frame.`),
      ),
    );
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
