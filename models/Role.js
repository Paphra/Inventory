var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoleSchema = new Schema({
  name: {type: String, required: true},
  description: {type: String}
});

// vritual for url
RoleSchema
  .virtual('url')
  .get(function(){
    return '/roles/' + this._id;
  });

// export the model
module.exports = mongoose.model('Role', RoleSchema);