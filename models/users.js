const mongoose=require('mongoose')
const {Schema}=mongoose;

const userSchema=new Schema({
    username:'string',
    password:'string',
    email:'string'
})
const users=mongoose.model('Usertodo',userSchema)
module.exports=users