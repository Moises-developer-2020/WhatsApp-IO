const {Router}= require('express');
const router=Router();

const verifyToken = require('../../libs/verifyToken');
const verifyTimeSession = require('../../libs/verifyTimeSession');

const User=require('../../models/user');

router.get('/chat',verifyTimeSession, verifyToken, async(req, res)=>{
    // console.log( req.userId );
    try {
        const userId=req.userId;
        const user=await User.findOne({'_id':userId});
        const{_id, name, email }=user
        const sendUser={_id, name, email};

        res.json({sendUser});
    } catch (error) {
       console.log('error'); 
    } 
    res.status(200).json({msm:'user not found'}); 
});

module.exports=router;
