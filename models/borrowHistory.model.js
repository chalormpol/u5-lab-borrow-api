const mongoose = require('mongoose');

const borrowHistorySchema = new mongoose.Schema({
  equipment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Equipment', 
    required: true 
  },

  borrower: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  borrowerName: { 
    type: String, 
    required: true 
  },

  borrowedAt: { 
    type: Date, 
    default: Date.now 
  },

  returnedAt: { 
    type: Date, 
    default: null 
  },

  status: { 
    type: String, 
    enum: ['borrowed', 'returned'], 
    default: 'borrowed' 
  }

}, { timestamps: true });

module.exports = mongoose.model('BorrowHistory', borrowHistorySchema);
