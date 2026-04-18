import { spawn } from 'child_process';

// Start backend server
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true
});

// Start Vite dev server after a short delay
setTimeout(() => {
  const client = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true
  });

  client.on('error', (err) => console.error('Client error:', err));

  process.on('SIGINT', () => {
    server.kill();
    client.kill();
    process.exit();
  });
}, 1500);

server.on('error', (err) => console.error('Server error:', err));
