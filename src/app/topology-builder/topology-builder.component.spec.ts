import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopologyBuilderComponent } from './topology-builder.component';

describe('TopologyBuilderComponent', () => {
  let component: TopologyBuilderComponent;
  let fixture: ComponentFixture<TopologyBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopologyBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopologyBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
