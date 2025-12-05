import { TestBed } from "@angular/core/testing";
import { HathiTrustConfigService } from "./hathi-trust-config.service";

describe("HathiTrustConfigService", () => {
  const TOKEN = "MODULE_PARAMETERS";

  it("returns defaults when provided an empty parameters object", () => {
    TestBed.configureTestingModule({
      providers: [
        HathiTrustConfigService,
        { provide: TOKEN, useValue: {} },
      ],
    });

    const service = TestBed.inject(HathiTrustConfigService);
    expect(service.disableWhenAvailableOnline).toBeTrue(); // default true
    expect(service.disableForJournals).toBeFalse(); // default false
    expect(service.ignoreCopyright).toBeFalse(); // default false
    expect(service.matchOnOclc).toBeTrue(); // default true
    expect(service.matchOnIsbn).toBeFalse(); // default false
    expect(service.matchOnIssn).toBeFalse(); // default false
  });

  it("respects explicit module parameter values", () => {
    TestBed.configureTestingModule({
      providers: [
        HathiTrustConfigService,
        {
          provide: TOKEN,
          useValue: {
            disableWhenAvailableOnline: false,
            disableForJournals: true,
            ignoreCopyright: true,
            matchOn: { oclc: false, isbn: true, issn: true },
          },
        },
      ],
    });

    const service = TestBed.inject(HathiTrustConfigService);
    expect(service.disableWhenAvailableOnline).toBeFalse();
    expect(service.disableForJournals).toBeTrue();
    expect(service.ignoreCopyright).toBeTrue();
    expect(service.matchOnOclc).toBeFalse();
    expect(service.matchOnIsbn).toBeTrue();
    expect(service.matchOnIssn).toBeTrue();
  });

  it("falls back to defaults for missing keys and partial matchOn", () => {
    TestBed.configureTestingModule({
      providers: [
        HathiTrustConfigService,
        {
          provide: TOKEN,
          useValue: {
            // only override one top-level and one nested key
            disableWhenAvailableOnline: false,
            matchOn: { isbn: true }, // oclc and issn missing
          },
        },
      ],
    });

    const service = TestBed.inject(HathiTrustConfigService);
    expect(service.disableWhenAvailableOnline).toBeFalse(); // provided
    expect(service.disableForJournals).toBeFalse(); // default
    expect(service.ignoreCopyright).toBeFalse(); // default
    expect(service.matchOnOclc).toBeTrue(); // default true when missing
    expect(service.matchOnIsbn).toBeTrue(); // provided true
    expect(service.matchOnIssn).toBeFalse(); // default false when missing
  });
});
