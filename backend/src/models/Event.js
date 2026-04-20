const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
