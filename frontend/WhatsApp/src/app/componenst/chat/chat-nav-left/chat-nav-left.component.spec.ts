import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatNavLeftComponent } from './chat-nav-left.component';

describe('ChatNavLeftComponent', () => {
  let component: ChatNavLeftComponent;
  let fixture: ComponentFixture<ChatNavLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatNavLeftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatNavLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
