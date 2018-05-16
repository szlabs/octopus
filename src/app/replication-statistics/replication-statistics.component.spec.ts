import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplicationStatisticsComponent } from './replication-statistics.component';

describe('ReplicationStatisticsComponent', () => {
  let component: ReplicationStatisticsComponent;
  let fixture: ComponentFixture<ReplicationStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplicationStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplicationStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
