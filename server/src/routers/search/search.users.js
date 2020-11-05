const {Router}=require('express');
const router=Router();

const verifyToken = require('../../libs/verifyToken');
const verifyTimeSession = require('../../libs/verifyTimeSession');

const User=require('../../models/user');

//show all users
router.get('/searchUsers',verifyTimeSession, verifyToken,async (req, res)=>{
    const users=await User.find({},{"name":1, "_id":1}).sort({"name":1});
    res.json({users})

});

router.get('/searchUsers/:name?',verifyTimeSession, verifyToken,async (req, res)=>{
    const name=req.params.name;
    
    const users=await User.find({name:new RegExp([name],"i")})
    
    res.json({users})

});

module.exports=router;