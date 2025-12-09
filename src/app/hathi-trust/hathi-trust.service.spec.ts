import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { HathiTrustService } from './hathi-trust.service';
import { HathiTrustApiService } from './hathi-trust-api/hathi-trust-api.service';
import { HathiTrustConfigService } from './hathi-trust-config/hathi-trust-config.service';
import { HathiTrustQuery } from './hathi-trust-api/hathi-trust-api.model';

describe('HathiTrustService', () => {
  let service: HathiTrustService;
  let apiMock: jasmine.SpyObj<HathiTrustApiService>;
  let configMock: Partial<HathiTrustConfigService>;

  beforeEach(() => {
    apiMock = jasmine.createSpyObj('HathiTrustApiService', ['findFullTextUrl']);

    configMock = {
      matchOnIsbn: false,
      matchOnOclc: false,
      matchOnIssn: false,
      disableWhenAvailableOnline: false,
      disableForJournals: false,
      ignoreCopyright: false,
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: HathiTrustApiService, useValue: apiMock },
        { provide: HathiTrustConfigService, useValue: configMock },
      ],
    });

    service = TestBed.inject(HathiTrustService);
  });

  it('returns undefined for non-local records', (done) => {
    const doc = {
      context: 'X',
      pnx: { addata: {} },
      delivery: { GetIt1: [] },
    } as any;
    service.findFullTextFor(doc).subscribe((v) => {
      expect(v).toBeUndefined();
      done();
    });
  });

  it('returns undefined when the record has no searchable IDs', (done) => {
    const doc = {
      context: 'L',
      pnx: { addata: {} },
      delivery: { GetIt1: [] },
    } as any;
    service.findFullTextFor(doc).subscribe((v) => {
      expect(v).toBeUndefined();
      expect(apiMock.findFullTextUrl).not.toHaveBeenCalled();
      done();
    });
  });

  it('passes ISBNs to HT API when matchOnIsbn is true', (done) => {
    (configMock as any).matchOnIsbn = true;
    const returnedUrl = 'https://catalog.hathitrust.org/Record/123456789';
    apiMock.findFullTextUrl.and.returnValue(of(returnedUrl));

    const doc = {
      context: 'L',
      pnx: { addata: { isbn: ['9781234567897'] } },
      delivery: { GetIt1: [] },
    } as any;

    service.findFullTextFor(doc).subscribe((v) => {
      expect(v).toBe(returnedUrl);
      expect(apiMock.findFullTextUrl).toHaveBeenCalledWith(
        new HathiTrustQuery({ isbn: ['9781234567897'] })
      );
      done();
    });
  });

  it('returns undefined when disableWhenAvailableOnline is true and doc has online availability', (done) => {
    (configMock as any).disableWhenAvailableOnline = true;
    (configMock as any).matchOnOclc = true;
    const doc = {
      context: 'L',
      pnx: { addata: { oclcid: ['(OCoLC)12345'] } },
      delivery: { GetIt1: [{ links: [{ isLinktoOnline: true }] }] },
    } as any;

    apiMock.findFullTextUrl.and.returnValue(of('should-not-be-called'));

    service.findFullTextFor(doc).subscribe((v) => {
      expect(v).toBeUndefined();
      expect(apiMock.findFullTextUrl).not.toHaveBeenCalled();
      done();
    });
  });

  it('passes OCLC IDs to HT API when matchOnOclc true', (done) => {
    (configMock as any).matchOnOclc = true;
    const returnedUrl = 'https://catalog.hathitrust.org/Record/123456789';
    apiMock.findFullTextUrl.and.returnValue(of(returnedUrl));

    const doc = {
      context: 'L',
      pnx: { addata: { oclcid: ['(OCoLC)12345', 'ocn6789', 'notoclc'] } },
      delivery: { GetIt1: [] },
    } as any;

    service.findFullTextFor(doc).subscribe((v) => {
      expect(v).toBe(returnedUrl);
      expect(apiMock.findFullTextUrl).toHaveBeenCalledWith(
        new HathiTrustQuery({ oclc: ['12345', '6789'] })
      );
      done();
    });
  });

  it('passes ISSNs to HT API when matchOnIssn is true', (done) => {
    (configMock as any).matchOnIssn = true;
    (configMock as any).matchOnOclc = true;
    const returnedUrl = 'https://catalog.hathitrust.org/Record/123456789';
    apiMock.findFullTextUrl.and.returnValue(of(returnedUrl));

    const doc = {
      context: 'L',
      pnx: {
        addata: {
          oclcid: ['(OCoLC)12345', 'ocn6789', 'notoclc'],
          issn: ['0028-0836'],
        },
      },
      delivery: { GetIt1: [] },
    } as any;

    service.findFullTextFor(doc).subscribe((v) => {
      expect(v).toBe(returnedUrl);
      expect(apiMock.findFullTextUrl).toHaveBeenCalledWith(
        new HathiTrustQuery({ oclc: ['12345', '6789'], issn: ['0028-0836'] })
      );
      done();
    });
  });

  it('returns undefined when disableForJournals true and record is a journal', (done) => {
    (configMock as any).matchOnIssn = true;
    (configMock as any).disableForJournals = true;

    const doc = {
      context: 'L',
      pnx: { addata: { issn: ['0028-0836'], format: ['Journal'] } },
      delivery: { GetIt1: [] },
    } as any;

    apiMock.findFullTextUrl.and.returnValue(of('should-not-be-called'));

    service.findFullTextFor(doc).subscribe((v) => {
      expect(v).toBeUndefined();
      expect(apiMock.findFullTextUrl).not.toHaveBeenCalled();
      done();
    });
  });
});
