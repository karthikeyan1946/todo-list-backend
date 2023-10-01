const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
const passport=require('passport')
const users=require('../models/users')

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret token';


passport.use(new JwtStrategy(opts,(jwt_payload, done) =>{
    users.findOne({id: jwt_payload.sub}).then(user=>{
        if(user){
            return done(null,user)
        }else{
            return done(null,null)
        }
    })
    .catch(err=>{
        return done(err,false)
    })
})
);