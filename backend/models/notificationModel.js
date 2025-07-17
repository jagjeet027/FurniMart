import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  isNew: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manufacturer',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 
  }
});

 const Notification = mongoose.model('Notification', notificationSchema);

 export default Notification;