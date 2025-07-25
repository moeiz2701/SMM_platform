const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');




// After express and before routes

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const adBudgetRoutes = require('./routes/adBudgetRoutes');
const aiToolsRoutes = require('./routes/aiToolsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const clientRoutes = require('./routes/clientRoutes');
const managerRoutes = require('./routes/managerRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const socialAccountRoutes = require('./routes/socialAccountRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3001', // your actual frontend domain
  credentials: true,               // allow cookies / sessions
}));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/budgets', adBudgetRoutes);
app.use('/api/v1/ai-tools', aiToolsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/managers', managerRoutes);
app.use('/api/v1/oauth', oauthRoutes);
app.use('/api/v1/social-accounts', socialAccountRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});