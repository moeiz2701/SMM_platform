const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');

// Generate PDF report from analytics data
exports.generatePDFReport = async (report) => {
  try {
    // Create PDF directory if it doesn't exist
    const pdfDir = path.join(__dirname, '../public/reports');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfPath = path.join(pdfDir, `report-${report._id}.pdf`);
    const templatePath = path.join(__dirname, '../templates/reportTemplate.ejs');

    // Render HTML with EJS
    const html = await ejs.renderFile(templatePath, { report });

    // Create PDF with Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    await browser.close();

    return pdfPath;
  } catch (err) {
    console.error('PDF generation error:', err);
    throw err;
  }
};

// Calculate engagement rate
exports.calculateEngagementRate = (likes, comments, shares, reach) => {
  if (!reach || reach === 0) return 0;
  const engagements = likes + comments + (shares * 2); // Weight shares more
  return ((engagements / reach) * 100).toFixed(2);
};

// Generate performance insights
exports.generatePerformanceInsights = (metrics) => {
  const insights = [];

  if (metrics.totalPosts > 0) {
    const avgEngagement = metrics.totalEngagements / metrics.totalPosts;
    
    if (avgEngagement > 10) {
      insights.push("Your content is performing above average in engagement");
    } else {
      insights.push("Consider optimizing your content for higher engagement");
    }
  }

  if (metrics.totalCampaigns > 0) {
    const avgROI = metrics.totalSpend > 0 ? 
      ((metrics.totalConversions * 100) / metrics.totalSpend).toFixed(2) : 0;
    
    insights.push(`Average ROI across campaigns: ${avgROI}%`);
  }

  return insights;
};