import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistryServerComponent } from './registry-server.component';

describe('RegistryServerComponent', () => {
  let component: RegistryServerComponent;
  let fixture: ComponentFixture<RegistryServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistryServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistryServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
