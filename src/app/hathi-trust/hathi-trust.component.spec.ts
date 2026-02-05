import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { HathiTrustComponent } from './hathi-trust.component';
import { HathiTrustService } from './hathi-trust.service';
import { SearchResultFacade } from './primo-search-result/search-result.facade';
import { TranslateService } from '@ngx-translate/core';

describe('HathiTrustComponent', () => {
  let component: HathiTrustComponent;
  let hathiTrustService: jasmine.SpyObj<HathiTrustService>;
  let searchResultFacade: jasmine.SpyObj<SearchResultFacade>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    hathiTrustService = jasmine.createSpyObj('HathiTrustService', [
      'findFullTextFor',
    ]);
    searchResultFacade = jasmine.createSpyObj('SearchResultFacade', [
      'getSearchResult',
    ]) as jasmine.SpyObj<SearchResultFacade>;
    translateService = jasmine.createSpyObj('TranslateService', ['get']);

    await TestBed.configureTestingModule({
      imports: [HathiTrustComponent],
      providers: [
        { provide: HathiTrustService, useValue: hathiTrustService },
        { provide: SearchResultFacade, useValue: searchResultFacade },
        { provide: TranslateService, useValue: translateService },
      ],
    }).compileComponents();

    // override template to avoid rendering auxiliary components
    TestBed.overrideComponent(HathiTrustComponent, {
      set: { template: '' },
    });

    translateService.get.and.returnValue(of('HathiTrust.availabilityText'));
  });

  it('uses currentFullDisplay$ when hostComponent.isFullDisplay is true', async () => {
    const record = { pnx: { control: { recordid: ['123'] } } } as any;
    (searchResultFacade as any).currentFullDisplay$ = of(record);
    hathiTrustService.findFullTextFor.and.returnValue(of('http://example.com/123'));

    const fixture = TestBed.createComponent(HathiTrustComponent);
    component = fixture.componentInstance;
    component.hostComponent = { isFullDisplay: true, searchResult: record } as any;

    const url = await firstValueFrom(component.fullTextUrl$);
    expect(url).toBe('http://example.com/123');
    expect(hathiTrustService.findFullTextFor).toHaveBeenCalledWith(record);
  });

  it('calls getSearchResult when hostComponent.isFullDisplay is false', async () => {
    const hostComponentRecord = { pnx: { control: { recordid: ['123'] } } } as any;
    const storeRecord = { pnx: { control: { recordid: ['123'] } } } as any;
    searchResultFacade.getSearchResult.and.returnValue(of(storeRecord));
    hathiTrustService.findFullTextFor.and.returnValue(of('http://example.com/123'));

    const fixture = TestBed.createComponent(HathiTrustComponent);
    component = fixture.componentInstance;
    component.hostComponent = { isFullDisplay: false, searchResult: hostComponentRecord } as any;

    const url = await firstValueFrom(component.fullTextUrl$);
    expect(url).toBe('http://example.com/123');
    expect(searchResultFacade.getSearchResult).toHaveBeenCalledWith('123');
    expect(hathiTrustService.findFullTextFor).toHaveBeenCalledWith(storeRecord);
  });

  it('maps untranslated availability key to default text', async () => {
    translateService.get.and.returnValue(of('HathiTrust.availabilityText'));
    const fixture = TestBed.createComponent(HathiTrustComponent);
    component = fixture.componentInstance;
    const text = await firstValueFrom(component.availabilityText$);
    expect(text).toBe('Full text from HathiTrust');
  });

  it('uses translated availability text when available', async () => {
    translateService.get.and.returnValue(of('Yay! Available via HathiTrust'));
    const fixture = TestBed.createComponent(HathiTrustComponent);
    component = fixture.componentInstance;
    const text = await firstValueFrom(component.availabilityText$);
    expect(text).toBe('Yay! Available via HathiTrust');
  });
});
