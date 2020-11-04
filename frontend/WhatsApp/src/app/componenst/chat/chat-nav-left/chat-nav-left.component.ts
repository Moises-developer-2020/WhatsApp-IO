import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-nav-left',
  templateUrl: './chat-nav-left.component.html',
  styleUrls: ['./chat-nav-left.component.css']
})
export class ChatNavLeftComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    
  }

  openSearch(key, type:boolean){
   type?key.classList.add('show'):key.classList.remove('show');
  }
  
}
