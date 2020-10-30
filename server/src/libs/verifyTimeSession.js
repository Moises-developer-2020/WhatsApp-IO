const Buffer=require('buffer');

const verifyTimeSession=function(req, res, next){


    let DateReceived = req.headers.authorization.split(' ')[2];
    let DateDesencrypt=new Date(Buffer.Buffer.from(DateReceived, 'base64').toString('ascii'));
    let timeDesencrypt=DateDesencrypt.toLocaleTimeString('en-US');

    let dateNow=new Date();
    let timestampNow=dateNow.toLocaleTimeString('en-US');


    
    function difference_between_dates(date__now, last_date){
        var hours1 = (date__now.substring(0,date__now.indexOf(" "))).split(":"),
        hours2 = (last_date.substring(0,last_date.indexOf(" "))).split(":"),
        t1 = new Date(),
        t2 = new Date();

        t1.setHours(hours1[0], hours1[1], hours1[2]);
        t2.setHours(hours2[0], hours2[1], hours2[2]); 
        
        //Aquí hago la resta
        t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());
        

        return JSON.parse(`
        {"date":{
            "hours":${t1.getHours()},
            "minutes":${t1.getMinutes()},
            "seconds":${t1.getSeconds()}
        }}
        `);
    }

    var elapseTime=difference_between_dates(timestampNow, timeDesencrypt);
    console.log(elapseTime);
    if(elapseTime.date.hours>0 || elapseTime.date.minutes>15) return res.status(400).json({msm:"session has expired"});

    next();
}
module.exports=verifyTimeSession;