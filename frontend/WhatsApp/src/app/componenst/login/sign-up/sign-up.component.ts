import { Component, OnInit } from '@angular/core';

//service
import { AuthServiceService } from "../../../services/login/auth-service.service";
//form
import { NgForm } from "@angular/forms";

//router for send email to signIn
import { Router } from "@angular/router";



@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  //respons the users-register
  response:boolean;
  response_API:any;

  constructor(private authService:AuthServiceService, private router:Router) { }

  ngOnInit(): void {

  }

  SignUp(form:NgForm){
    
    this.response=true;
    const {name, email, password, RepeatPassword}=form.value;
    
    if(password===RepeatPassword){
     this.authService.signUp(form.value)
     .subscribe(
       res=>{
       console.log(res);
      //send email to signIn for medio the service if the register is correct
       this.authService.signIn_Email=email;
       form.resetForm();
       this.router.navigate(['/login/signIn']);
       
       
     },err=>{
      this.response=false;
      this.response_API=err.error.name;
      console.log(err.error.name);
     }
     
     );
      
    }else{
      console.log(false); 
    }
    
    
  }

}
