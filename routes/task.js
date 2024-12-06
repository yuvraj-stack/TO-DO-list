const mongoose=require('mongoose');
const taskSchema=new mongoose.Schema({
    task:{
        type:String,
        required:true
    }
    ,
    createdAt:{
        type:Date,
        default:Date.now
    }
    ,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }
})
module.exports=mongoose.model("task",taskSchema)