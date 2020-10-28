import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatNavTopComponent } from './chat-nav-top.component';

describe('ChatNavTopComponent', () => {
  let component: ChatNavTopComponent;
  let fixture: ComponentFixture<ChatNavTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatNavTopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatNavTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
