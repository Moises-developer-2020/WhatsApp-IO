const bcrypt=require('bcryptjs');

const helpert={};

helpert.encryptPassword= async (password)=>{
    const salt = await bcrypt.genSalt(10);
    const hast = await bcrypt.hash(password, salt);
    return hast;
};

helpert.matchPassword= async (password, savedPassword)=>{
    try{

        const result = await bcrypt.compare(password, savedPassword);
        return result;

    } catch(e){
        console.log(e);
    }
}
module.exports=helpert;