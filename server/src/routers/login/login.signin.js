const {Router} = require('express');
const router=Router();

const User=require('../../models/user');
const bcrypt= require('../../libs/helperst');
const jwt=require('jsonwebtoken');


router.post('/signIn',async (req, res)=>{
    const {email, password}=req.body;

    //validation the email
    if(!/^[a-z0-9_.]+@[a-z0-9]+\.[a-z0-9_.]+$/i.test(email)) return res.status(400).json({msm:'Incorrect format'});
     
    const user= await User.findOne({email});

    if(!user) return res.status(400).json({msm:'Email not found'});

    const Matchpassword=await bcrypt.matchPassword(password,user.password);

    if(!Matchpassword) res.status(400).json({msm:'Wrong Password'});

    //const token=jwt.sign({_id:user._id},'secretKey',{expiresIn:900});//900 15m en s
    const token=jwt.sign({_id:user._id},'secretKey',{expiresIn:7200});//expira en 2 h

    return res.status(200).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        token
    });

});

module.exports=router;