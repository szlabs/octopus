import { TestBed, async, inject } from '@angular/core/testing';

import { LoggedGuardGuard } from './logged-guard.guard';

describe('LoggedGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggedGuardGuard]
    });
  });

  it('should ...', inject([LoggedGuardGuard], (guard: LoggedGuardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
