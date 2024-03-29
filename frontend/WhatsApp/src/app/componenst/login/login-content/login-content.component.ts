import { Component, OnInit } from '@angular/core';

import { Router } from "@angular/router";
import { AuthServiceService } from "../../../services/login/auth-service.service";

@Component({
  selector: 'app-login-content',
  templateUrl: './login-content.component.html',
  styleUrls: ['./login-content.component.css']
})
export class LoginContentComponent implements OnInit {

  constructor(private auth:AuthServiceService, private router:Router) { 
    //this.auth.logout();
    if(this.auth.loggedIn()){
      if(this.auth.refreshToken()){
        this.router.navigate(['/chat']);
      }
    }
    
  }

  ngOnInit(): void {

    
    
  }

}
