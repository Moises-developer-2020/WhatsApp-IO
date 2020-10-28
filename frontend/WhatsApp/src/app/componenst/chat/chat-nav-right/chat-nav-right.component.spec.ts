import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatNavRightComponent } from './chat-nav-right.component';

describe('ChatNavRightComponent', () => {
  let component: ChatNavRightComponent;
  let fixture: ComponentFixture<ChatNavRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatNavRightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatNavRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
