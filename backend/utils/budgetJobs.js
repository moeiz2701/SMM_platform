const cron = require('node-cron');
const AdBudget = require('../models/AdBudget');
const { updateMonthlyBreakdown, updateWeeklyBreakdown, checkAndNotifyThresholds } = require('../controllers/adBudgetController');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log(`[CRON] Running daily budget maintenance: ${new Date().toISOString()}`);

  try {
    const budgets = await AdBudget.find();

    for (const budget of budgets) {
      await updateWeeklyBreakdown(budget._id);
      await updateMonthlyBreakdown(budget._id);
      await checkAndNotifyThresholds(budget._id);
    }

    console.log('[CRON] Budget updates completed.');
  } catch (err) {
    console.error('[CRON ERROR] Failed to run budget jobs:', err.message);
  }
});
