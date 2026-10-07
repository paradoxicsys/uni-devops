const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 8080;
const server = createApp().listen(PORT, () => {
  console.log(`final-devops-app listening on port ${PORT}`);
});

// graceful shutdown so rolling updates do not drop requests
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server');
  server.close(() => process.exit(0));
});
