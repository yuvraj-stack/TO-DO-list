const mongoose = require('mongoose');
const plm=require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Todo_app")
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  password: {
    type: String
  },
  tasks:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'task'
    }
  ]
  ,
  taskhistory:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'history'
  }]
});
userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);