const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema({
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'AdCampaign', required: true },
  budget: { type: mongoose.Schema.Types.ObjectId, ref: 'AdBudget', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'Pending' },
  dueDate: { type: Date, required: true },
  generatedAt: { type: Date, default: Date.now },
    issuedDate: { type: Date, default: Date.now },
    paymentDate: { type: Date },
})

module.exports = mongoose.model('Invoice', invoiceSchema)