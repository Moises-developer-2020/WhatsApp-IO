const {Router}= require('express');
const router=Router();

const verifyToken = require('../../libs/verifyToken');
const User=require('../../models/user');

router.get('/chat',verifyToken, async(req, res)=>{
    console.log( req.userId );
    const user=await User.findOne({'_id':req.userId});
    const{_id, name, email }=user
    const sendUser={_id, name, email};
    res.json({sendUser});
});

module.exports=router;
