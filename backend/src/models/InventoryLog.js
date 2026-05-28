const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    changeType: {
      type: String,
      required: true,
      enum: ['sale', 'manual-add', 'manual-reduce', 'restock', 'return'],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
    },
    performedBy: {
      type: String,
      required: true,
      default: 'System',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
