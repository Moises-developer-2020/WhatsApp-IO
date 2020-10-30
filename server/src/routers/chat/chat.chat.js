const {Router}= require('express');
const router=Router();

const verifyToken = require('../../libs/verifyToken');
const verifySession=require('../../libs/verifyTimeSession');

const User=require('../../models/user');
const verifyTimeSession = require('../../libs/verifyTimeSession');

router.get('/chat',verifyToken, verifyTimeSession, async(req, res)=>{
    console.log( req.userId );
    const user=await User.findOne({'_id':req.userId});
    const{_id, name, email }=user
    const sendUser={_id, name, email};
    res.json({sendUser});
});

module.exports=router;
