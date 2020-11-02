import { Component, OnInit, ViewChild } from '@angular/core';

//import email receive of service
import { AuthServiceService } from "../../../services/login/auth-service.service";
//use form
import { NgForm } from "@angular/forms";

import { Router } from "@angular/router";

import * as CryptoJS from "crypto-js";


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {


  email_Receive:any;

  //message to user when login
  response_signIn:boolean=false;
  response_API:any;

  //of encript end decrypt
  private emailEncrypt:any=[];
  emailDecrypt=[];
  private readonly passUserEncrypJS="UserEncryptJS";

  constructor(private authService:AuthServiceService, private router:Router) {
    //email receive of the service if register is correct
    this.email_Receive=authService.signIn_Email;
    //console.log(authService.signIn_Email);
    
  }

  ngOnInit(): void {
   // console.log(CryptoJS.AES.encrypt("HOLA SOY MOISES","MOISES").toString());
    this.dataSave();
    //this.authService.logout();
    
  }

  //if exist previous Start the logueo
  PreviousStart():boolean{
    return !! localStorage.getItem('PVS');
  }


  //data saved the PreviousStart
  dataSave(){
    
    if(this.PreviousStart()){
      const PVS=localStorage.getItem('PVS');
      const JsonPVS=JSON.parse(PVS);
      //console.log( JsonPVS );
      this.emailEncrypt=JsonPVS;//si ya hay cuentas las guardo aqui para poder insertarlas de nuevo
      
      for(var i in JsonPVS){
        //console.log(JsonPVS[i]);
        //this.emailDecrypt.push(JsonPVS[i].PVS);

        //desencrypto el email y lo agrego  al array
        var h={
          _id:i,//para poder manipular las sessiones
          email:CryptoJS.AES.decrypt(JsonPVS[i].PVS,this.passUserEncrypJS).toString(CryptoJS.enc.Utf8)
        }
        this.emailDecrypt.push(h);
        
      }
    }
    
    //this.emailDecrypt=CryptoJS.AES.decrypt(PVS,this.passUserEncrypJS).toString(CryptoJS.enc.Utf8);
    //console.log(this.emailDecrypt);
    
    
  }

  signIn(form:NgForm){
    this.response_API='';
    this.response_signIn=true;
    this.authService.signIn(form.value)
    .subscribe(
      res=>{
        
        this.response_signIn=false;
        //console.log(res);

        //valido si el email ya esta guardado sino lo inserto
        var existEmailSaved=false;
        for(var e in this.emailDecrypt){
         // console.log(this.emailDecrypt[e].email);
          if(this.emailDecrypt[e].email==form.value.email){
            existEmailSaved=true;
          }
          
        }

        if(existEmailSaved==false){
          //guardo los email validos en un array luego con stringify los almaceno en locaStorage
          if(this.PreviousStart()){//si ya existe uno solo inserto los demas sino empieza desde 0 a almacenar
            this.emailEncrypt.push({"PVS":CryptoJS.AES.encrypt(form.value.email,this.passUserEncrypJS).toString()});
          }else{
            this.emailEncrypt[this.emailEncrypt.length.toString()]={"PVS":CryptoJS.AES.encrypt(form.value.email,this.passUserEncrypJS).toString()};
          }
          //guardo el email en localStorage
          localStorage.setItem('PVS',JSON.stringify(this.emailEncrypt));
        }
        form.resetForm();

        //save token in localStorage

     
        localStorage.setItem('token',res.token +" "+btoa(Date()));
        /*var g=JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem('token'),this.passUserEncrypJS).toString(CryptoJS.enc.Utf8));
        console.log(JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem('token'),this.passUserEncrypJS).toString(CryptoJS.enc.Utf8)).token);
         */
        //anterior sin expireIn
       // localStorage.setItem('token',res.token);    
        
       
       
        
        this.router.navigate(['/chat']);
        
      },
      err=>{
        this.response_signIn=false;
        console.log(err.error);
        this.response_API=err.error.msm;
        
      }
    )
    
  }

  deleteSessionPrevious(id){
    
    console.log(id);
    this.emailEncrypt.splice(id,1);//este es el que vuelvo a guardar
    //this.emailDecrypt.splice(id,1);//este es que muestro
    localStorage.setItem('PVS',JSON.stringify(this.emailEncrypt));
    this.emailDecrypt=[];//lipio todo para dataSave lo vuelva a llenar
    this.dataSave();
  
    
  }

  sessionPrevious(email){
    this.email_Receive=email;
  }
  

}
