var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var FlowSchema = new Schema({
  item: {type: Schema.Types.ObjectId, ref: 'Stock', required: true},
  quantity: { type: Number, default: 0 },
  action: {
    type: String, enum: ['Sold', 'Rented', 'Used', 'Purchased', 'Returned In', 'Returned Out'], 
    default: 'Sold'},
  details: {type: String, required: true},
  quality: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'], required: true, default: 'Good' },
  amount: {type: Number, default: 0},
  branch: {type: Schema.Types.ObjectId, ref: 'Branch', required: true},
  entered_by: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  handled_by: {type: Schema.Types.ObjectId, ref: 'Worker', required: true},
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

