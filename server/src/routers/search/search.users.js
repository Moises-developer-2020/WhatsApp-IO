const {Router}=require('express');
const router=Router();

const verifyToken = require('../../libs/verifyToken');
const verifyTimeSession = require('../../libs/verifyTimeSession');

const User=require('../../models/user');

//show all users
router.get('/searchUsers',verifyTimeSession, verifyToken,async (req, res)=>{
    const MyID=req.userId;//send my id for add to the socket(userConeccted)
    const users=await User.find({_id:{$ne:MyID}},{"name":1, "_id":1}).sort({"name":1});//everyone exept mine
    res.json({MyID,users})

});

router.get('/searchUsers/:name?',verifyTimeSession, verifyToken,async (req, res)=>{
    const name=req.params.name;
    const MyID=req.userId;
    const users=await User.find({_id:{$ne:MyID},name:new RegExp([name],"i")})// buscar usuarios con como like de sql
    
    res.json({users})

});

module.exports=router;