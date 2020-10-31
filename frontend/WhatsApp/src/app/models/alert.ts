
export class Alert {
    constructor(status=false,message=""){
        this.alertInfo={
            status:status,
            message:message
        }
    }
    alertSigle?={
        estatus:false,
        data:{
          message:"",
          button:""/*url */
        }
    }

    alertInfo?={
        status:false,
        message:""

    }
    
}