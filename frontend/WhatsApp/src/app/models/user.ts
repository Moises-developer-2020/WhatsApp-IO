export class User {
    constructor(_id='',name='',email=''){
        this._id=_id;
        this.name=name;
        this.email=email;
    }
    _id?:String;
    name?:String;
    email?:String;
    
}
