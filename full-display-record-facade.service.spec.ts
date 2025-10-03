import { TestBed } from '@angular/core/testing';

import { FullDisplayRecordFacadeService } from './full-display-record-facade.service';

describe('FullDisplayRecordFacadeService', () => {
  let service: FullDisplayRecordFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FullDisplayRecordFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
