import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerFormComponent } from './server-form.component';

describe('ServerFormComponent', () => {
  let component: ServerFormComponent;
  let fixture: ComponentFixture<ServerFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
