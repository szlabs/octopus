import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplicationRuleComponent } from './replication-rule.component';

describe('ReplicationRuleComponent', () => {
  let component: ReplicationRuleComponent;
  let fixture: ComponentFixture<ReplicationRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplicationRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplicationRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
