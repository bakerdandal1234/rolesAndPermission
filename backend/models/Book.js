const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  summary: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
 images: [{
  type: String,
  required: false,
}]
,
  stock: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
