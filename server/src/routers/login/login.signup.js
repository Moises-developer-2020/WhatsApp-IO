const { Router } = require('express');
const router=Router();

const bcrypt = require('../../libs/helperst');
const User= require('../../models/user');
const jwt=require('jsonwebtoken');

//Users registration
router.post('/signUp',async (req, res)=>{
    //console.log(req.body);
    const {name, email, password}=req.body;

    //validation name only letters
    if(!/^[a-z ]+$/i.test(name)) return res.status(400).json({name:'Incorrect format'});

    //validation the email
    if(!/^[a-z0-9_.]+@[a-z0-9]+\.[a-z0-9_.]+$/i.test(email)) return res.status(400).json({email:'Incorrect format'});
    
    const NewUser=new User({name, email, password});
    //Encrypt password
    NewUser.password = await bcrypt.encryptPassword(password);

    //save User
    await NewUser.save();

    const token=jwt.sign({_id:NewUser._id},'secretKey');
    
    res.status(200).json({token});
});


module.exports=router;