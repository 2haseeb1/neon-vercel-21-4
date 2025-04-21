import { app } from './app';
import config from './config';
// Fix: Use named import

// Start the server
const startServer = () => {
  try {
    app.listen(config.port, () => {
      console.log(`Server running on port http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start the server in non-production environments (e.g., local dev)
// Vercel handles the server startup in production
if (config.nodeEnv !== 'production') {
  startServer();
}

// Export the app for Vercel
export default app;