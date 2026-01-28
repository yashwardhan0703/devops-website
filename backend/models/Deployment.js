const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
    index: true
  },
  commit: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'success', 'failed', 'rollback'],
    default: 'pending',
    index: true
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  logs: {
    type: String,
    default: ''
  },
  environment: {
    type: String,
    default: 'production'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
deploymentSchema.index({ createdAt: -1 });
deploymentSchema.index({ status: 1, createdAt: -1 });

const Deployment = mongoose.model('Deployment', deploymentSchema);

module.exports = Deployment;
