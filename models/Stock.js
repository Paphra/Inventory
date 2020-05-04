var mongoose  = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema

var StockSchema = new Schema({
  name:     { type: String, required: true, min: 3 },
  brand:    { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  color:    { type: String },
  size:     { w: { type: Number }, l: { type: Number }, h: { type: Number } },
  serial:   { type: String },
  quantity: { type: Number, default: 0 },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  status:   { type: String, required: true, enum: ['Available', 'Sold Out'], default: 'Available' },
  unit_price:{ type: Number, required: true },
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  modification: {type: Date, required: true, default: Date.now }
});

// virtual for the url
StockSchema
  .virtual('url')
  .get(function(){
    return '/stock/' + this._id;
  });

// virtual for modification date
StockSchema
  .virtual('modification_date')
  .get(function(){
    return moment(this.modification).format('MMM Do, YYYY');
  });

// export a model
module.exports = mongoose.model('Stock', StockSchema);