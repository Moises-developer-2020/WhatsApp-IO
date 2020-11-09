import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//router
import { Routes, RouterModule } from "@angular/router";
//httpModule service
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

//use form
import { FormsModule } from "@angular/forms";

//tokenInterceptor
import { TokenService } from "../app/services/token/token.service";

//auth guard
import { AuthGuard } from "./auth.guard";

import { AppComponent } from './app.component';
import { SignUpComponent } from './componenst/login/sign-up/sign-up.component';
import { SignInComponent } from './componenst/login/sign-in/sign-in.component';
import { ChatMessageComponent } from './componenst/chat/chat-message/chat-message.component';
import { ChatNavLeftComponent } from './componenst/chat/chat-nav-left/chat-nav-left.component';
import { LoginContentComponent } from './componenst/login/login-content/login-content.component';
import { AlertComponent } from './componenst/static/alert/alert.component';
import { EncryptComponent } from './componenst/static/encrypt/encrypt.component';
import { ChatNavRightComponent } from './componenst/chat/chat-nav-right/chat-nav-right.component';
import { ChatNavTopComponent } from './componenst/chat/chat-nav-top/chat-nav-top.component';
import { ChatContentComponent } from './componenst/chat/chat-content/chat-content.component';
import { PageNotFoundComponent } from './componenst/static/page-not-found/page-not-found.component';


//router config
const router:Routes=[
  {
    path:'',pathMatch:'full',redirectTo:'login'
  },
  {
    path:'login',component:LoginContentComponent,children:[
      {
        path:'',pathMatch:'prefix',redirectTo:'signIn'
      },
      {
        path:'signIn',component:SignInComponent
      },
      {
        path:'signUp',component:SignUpComponent
      }
    ]
  },
  {
    path:'chat',component:ChatContentComponent,canActivate:[AuthGuard]
  },
  {
    path:'chat/:user',component:ChatContentComponent,canActivate:[AuthGuard]
  },
  {
    path:'chat/:user/:emit',component:ChatContentComponent,canActivate:[AuthGuard]
  },
  {
    path:'**',component:PageNotFoundComponent
  }

]

@NgModule({
  declarations: [
    AppComponent,
    LoginContentComponent,
    SignUpComponent,
    SignInComponent,
    ChatMessageComponent,
    ChatNavLeftComponent,
    AlertComponent,
    EncryptComponent,
    ChatNavRightComponent,
    ChatNavTopComponent,
    ChatContentComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(router),
    HttpClientModule
  ],
  providers: [
     //es para que nuestras peticiones tengan una cabezera extra en 
    // Request Header en este cso Authorization
    {//para htttpInterceptor
      provide: HTTP_INTERCEPTORS,
      useClass: TokenService,
      multi:true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
