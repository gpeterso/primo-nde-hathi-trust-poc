import { TestBed } from '@angular/core/testing';

import { HathiTrustService } from './hathi-trust.service';

describe('HathiTrustService', () => {
  let service: HathiTrustService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HathiTrustService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
