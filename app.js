if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
//require('dotenv').config()



const express=require('express')
const app=express()
const mongoose=require('mongoose')
const {hashSync,compareSync}=require('bcrypt')
const cors=require('cors')
const jwt=require('jsonwebtoken')
const passport=require('passport')
const todos=require('./models/todos')
const users=require('./models/users')
require('./middleware/auth')


const dbUrl=process.env.DB_URL || 'mongodb://127.0.0.1:27017/todolist'
mongoose.connect(dbUrl)
.then(()=>{
    console.log('mongoose connection open')
})
.catch(()=>{
    console.log('error in connecting mongoose',e)
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(passport.initialize())
app.use((req,res,next)=>{
    next();
})




app.get('/auth',passport.authenticate('jwt',{session:false}),(req,res)=>{
    return res.send({
        success:true,
        user:{
            id:req.user.id,
            username:req.user.username
        }
    })

})

app.post('/register',async (req,res)=>{
    //console.log(req.body.user)
    let {username,password,email}=req.body.user
    let found=await users.findOne({email})
    if(found){
        res.send({
            success:false,
            message:'user already exists'
        })
    }else{
        const user=new users({
            username: username,
            password: hashSync(password,10),
            email: email
        })
        user.save()
        .then(user=>{
            const payload={
                username: user.username,
                id: user._id
            }
            const token=jwt.sign(payload,"secret token",{expiresIn: "1d"})
            res.send({
                success: true,
                message: "user created successfully",
                user:{
                    id: user._id,
                    username: user.username,
                    token:'Bearer '+token
                }
            })
        })
        .catch(err=>{
            console.log(err)
            res.send({
                success: false,
                message: "something went wrong",
                error: err
            })
        })
    }
})
app.post('/login',async (req,res)=>{
    let {username,password,email}=req.body.user
    let found=await users.findOne({email})
    if(!found){
        return res.send({
            success:false,
            message: 'user does not exists'
        })
    }
    if(!compareSync(password,found.password)){
        return res.send({
            success:false,
            message:'username or password is incorrect'
        })
    }
    const payload={
        username: username,
        id: found._id
    }
    const token=jwt.sign(payload,"secret token",{expiresIn: "365d"})
    const todo=await todos.findOne({author:found._id})
    console.log(todo)
    let currtodos=todo.todos || [];
    return res.send({
        success:true,
        message:'logged in successfully',
        user:{
            id: found._id,
            username: found.username,
            token:'Bearer '+token
        },
        todos:[...currtodos]
    })
})



app.put('/todos/:id',async (req,res)=>{
    let {id}=req.params
    let todo=req.body.todo
    try{
        let found=await todos.findOne({author:id})
        found.todos=todo
        await found.save()
        //console.log(found)
        return res.send({
            success:true,
            message:'successfully updated your todolist',
            out:{
                todo:[...found.todos]
            }
        })
    }catch(err){
        console.log(err)
    }
    

})
app.patch('/todos/:id/:todoid',async (req,res)=>{
    let {id,todoid}=req.params
    //console.log('patching')
    try{
        let found=await todos.findOne({author:id})
        let newTodo=found.todos.map(t=>{
            let x=t.completed
            if(t.equals(todoid)){
                t.completed=!x;
                return {...t}
            }else{
                return {...t}
            }
        })
        found.todos=newTodo
        await found.save()
        res.send({
            success:true,
            message:'completed your todo sucessfully',
            out:{
                todos:[...found.todos]
            }
        })
    }catch(err){
        console.log(err)
    }
})
app.delete('/todos/:id/:todoid',async (req,res)=>{
    let {id,todoid}=req.params
    //console.log('delete')
    try{
        let found=await todos.findOne({author:id})
        let newTodo=found.todos.filter(t=>{
            //console.log(t._id,todoid)
            return !t.equals(todoid)
        })
        //console.log(newTodo)
        found.todos=newTodo
        await found.save()
        res.send({
            success:true,
            message:'deleted your todo sucessfully',
            out:{
                todos:[...found.todos]
            }
        })
    }catch(err){
        console.log(err)
    }
    


})
app.get('/todos/:id',async (req,res)=>{
    let {id}=req.params;
    //console.log('under gettting all todos')
    todos.findOne({author:id}).then(found=>{
        //console.log(found.todos)
        res.send({
            success:true,
            out:{
                todos:[...found.todos]
            }
            
        })
    })
    .catch(err=>{
        res.send({
            success:false,
            message:'user doesnot exists',
            err:err
        })
    })
})
app.post('/todos/:id',async (req,res)=>{
    let todo=req.body.todo
    let {id}=req.params
    //console.log('posting')
    //console.log(id)
    let found=await todos.findOne({author: id});
    if(found){
        found.todos.push(todo)
        await found.save()
        return res.send({
            success:true,
            message:'added new todo success',
            out:{
                todos:[...found.todos]
            }
        })
        //console.log(found)
    }
    let foundUser=await users.findById(id)
    //console.log(foundUser)
    let newTodo=new todos()
    newTodo.author=foundUser._id
    newTodo.todos.push(todo)
    //console.log(newTodo)
    await newTodo.save()
    return res.send({
        success:true,
        message:'added new todo success',
        out:{
            todos:[...newTodo.todos]
        }
    })
})
app.delete('/todos/:id',async (req,res)=>{
    let {id}=req.params
    try{
        let found=await todos.findOne({author:id})
        found.todos=[]
        await found.save()
        return res.send({
            success:'true',
            message:'deleted complete todolist'
        })
    }catch(err){
        console.log(err)
    }
})




app.listen('3000',(req,res)=>{
    console.log('port on 3000')
})
