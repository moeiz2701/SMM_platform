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

if (process.env.NODE_ENV !== 'test') { // Don't run in test environment
  const initScheduler = require('./utils/scheduler');
  require ('./utils/budgetJobs');
  initScheduler();
}

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
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes')
const campaignRoutes = require('./routes/campaignRoutes')

const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(cookieParser());

// Enable CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
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
app.use('/api/v1/managers/:managerId/reviews', reviewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ad-campaigns', campaignRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/messages', messageRoutes);


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