import { TestBed } from '@angular/core/testing';

import { HathiTrustConfigService } from './hathi-trust-config.service';

describe('HathiTrustConfigService', () => {
  let service: HathiTrustConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HathiTrustConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
