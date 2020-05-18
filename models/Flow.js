var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var FlowSchema = new Schema({
  item: {type: Schema.Types.ObjectId, ref: 'Stock', required: true},
  quantity: { type: Number, default: 0 },
  
  brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  color:    { type: String },
  size:     { type: String },
  serial: { type: String },
  
  action: {
    type: String, 
    enum: [
      'Sold', 'Taken', 'Transfered Out', 'Returned Out',
      'Received', 'Transfered In', 'Purchased', 'Returned In' ], 
    default: 'Sold'},
  details: {type: String, required: true},
  quality: {
    type: String,
    enum: [ 'Excellent', 'Good', 'Fair', 'Poor' ], required: true,
    default: 'Good'
  },
  
  amount: { type: Number, default: 0 },
  branch: {type: Schema.Types.ObjectId, ref: 'Branch', required: true},
  
  entered_by: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  handled_by: {type: String, required: true}, // the one who took or returned the Stock Item
  entry_date: {type: Date, required: true, default: Date.now }
});

// virtual for url
FlowSchema
  .virtual('url')
  .get(function(){
    return '/flows/' + this._id;
  });

// virtual for dentry_date_formated
FlowSchema
  .virtual('entry_date_formated')
  .get(function(){
    return moment(this.entry_date).format('MMM Do, YYYY');
  });

// export the model
module.exports = mongoose.model('Flow', FlowSchema);

