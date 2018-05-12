import { TestBed, inject } from '@angular/core/testing';

import { RegistryManagementService } from './registry-management.service';

describe('RegistryManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegistryManagementService]
    });
  });

  it('should be created', inject([RegistryManagementService], (service: RegistryManagementService) => {
    expect(service).toBeTruthy();
  }));
});
