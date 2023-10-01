const mongoose=require('mongoose')
const {Schema}=mongoose
const users=require('./users')
const todosSchema=new Schema({
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    todos:[
        {
            completed:'boolean',
            todo:'string'
        }
    ]
})
const todos=mongoose.model('Todo',todosSchema);
module.exports=todos