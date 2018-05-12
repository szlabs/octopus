import { TestBed, inject } from '@angular/core/testing';

import { PolicyBuilderService } from './policy-builder.service';

describe('PolicyBuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PolicyBuilderService]
    });
  });

  it('should be created', inject([PolicyBuilderService], (service: PolicyBuilderService) => {
    expect(service).toBeTruthy();
  }));
});
