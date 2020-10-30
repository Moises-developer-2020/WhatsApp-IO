const jwt= require('jsonwebtoken');

//verify token desde el header request del navegador
const verifyToken= function(req, res, next){

   try{
        if(!req.headers.authorization){
            return res.status(401).send("Unauthorised request");
        }
        const token=req.headers.authorization.split(' ')[1];
        //console.log(token);
        if(token == null){
            return res.status(401).send("Unauthorised request");
        }

        const payload=jwt.verify(token,'secretKey');
       // console.log(payload);
        req.userId=payload._id;
        
        next();

   }catch(e){
       //console.log(e);
       return res.status(401).send("Error Unauthorised request");

   }
}
module.exports=verifyToken;