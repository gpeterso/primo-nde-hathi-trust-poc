import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HathiTrustComponent } from "./hathi-trust.component";
import { of } from "rxjs";
import { HathiTrustService } from "./hathi-trust.service";
import { FullDisplayRecordFacade } from "../search-result/full-display-record.facade";
import { HathiTrustLinkComponent } from "./hathi-trust-link/hathi-trust-link.component";
import { By } from "@angular/platform-browser";

describe("HathiTrustComponent", () => {
  let component: HathiTrustComponent;
  let fixture: ComponentFixture<HathiTrustComponent>;

  let hathiTrustServiceMock: jasmine.SpyObj<HathiTrustService>;
  let fullDisplayRecordFacadeMock: Partial<FullDisplayRecordFacade>;

  beforeEach(() => {
    hathiTrustServiceMock = jasmine.createSpyObj("HathiTrustService", [
      "findFullTextFor",
    ]);

    fullDisplayRecordFacadeMock = {
      currentRecordWithDelivery$: of(),
    };

    TestBed.configureTestingModule({
      imports: [HathiTrustComponent],
      providers: [
        { provide: HathiTrustService, useValue: hathiTrustServiceMock },
        {
          provide: FullDisplayRecordFacade,
          useValue: fullDisplayRecordFacadeMock,
        },
      ],
    });

    fixture = TestBed.createComponent(HathiTrustComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("passes the host component's searchResult to the HathiTrustService when view state is not full display", (done) => {
    const searchResult = { context: "L", id: "r1" } as any;
    const deliveryValue = { availability: "online" } as any;
    const deliveryFn = jasmine
      .createSpy("delivery")
      .and.returnValue(deliveryValue);

    const hostComponent = {
      searchResult,
      delivery: deliveryFn,
      isFullDisplay: false,
    } as any;

    const returnedUrl = "http://hathitrust.example/fulltext1";
    hathiTrustServiceMock.findFullTextFor.and.returnValue(of(returnedUrl));

    component.hostComponent = hostComponent;
    fixture.detectChanges(); // triggers ngOnInit

    expect(deliveryFn).toHaveBeenCalled();

    // subscribe to the observable to assert the emitted value
    component.fullTextUrl$?.subscribe((url) => {
      expect(url).toBe(returnedUrl);
      // ensure findFullTextFor was called with the searchResult augmented with delivery value
      expect(hathiTrustServiceMock.findFullTextFor).toHaveBeenCalledWith({
        ...searchResult,
        delivery: deliveryValue,
      });
      done();
    });
  });

  it("passes the searchResult from the FullDisplayRecordFacade to the HathiTrust service when view state is full display", (done) => {
    const facadeRecord = {
      context: "L",
      id: "r2",
      delivery: { availability: "online-2" },
    } as any;
    (fullDisplayRecordFacadeMock as any).currentRecordWithDelivery$ =
      of(facadeRecord);

    const returnedUrl = "http://hathitrust.example/fulltext2";
    hathiTrustServiceMock.findFullTextFor.and.returnValue(of(returnedUrl));

    const hostComponent = {
      // hostComponent is present but isFullDisplay true forces use of facade observable
      searchResult: { context: "X" } as any,
      delivery: () => ({}),
      isFullDisplay: true,
    } as any;

    component.hostComponent = hostComponent;
    fixture.detectChanges(); // triggers ngOnInit which subscribes to facade observable

    component.fullTextUrl$?.subscribe((url) => {
      expect(url).toBe(returnedUrl);
      expect(hathiTrustServiceMock.findFullTextFor).toHaveBeenCalledWith(
        facadeRecord
      );
      done();
    });
  });

  it("displays a HathiTrustLinkComponent when HathiTrustService returns a URL", (done) => {
    const searchResult = { context: "L", id: "r3" } as any;
    const deliveryValue = { availability: "online-3" } as any;
    const deliveryFn = jasmine
      .createSpy("delivery")
      .and.returnValue(deliveryValue);

    const hostComponent = {
      searchResult,
      delivery: deliveryFn,
      isFullDisplay: false,
    } as any;

    const returnedUrl = "http://hathitrust.example/render1";
    hathiTrustServiceMock.findFullTextFor.and.returnValue(of(returnedUrl));

    component.hostComponent = hostComponent;
    fixture.detectChanges();

    // wait for async pipe and change detection to stabilize
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const linkDe = fixture.debugElement.query(
        By.directive(HathiTrustLinkComponent)
      );
      expect(linkDe).toBeTruthy();
      done();
    });
  });

  it("does not display a HathiTrustLinkComponent when HathiTrustService return undefined", (done) => {
    const searchResult = { context: "L", id: "r4" } as any;
    const deliveryFn = jasmine.createSpy("delivery").and.returnValue({});
    const hostComponent = {
      searchResult,
      delivery: deliveryFn,
      isFullDisplay: false,
    } as any;

    hathiTrustServiceMock.findFullTextFor.and.returnValue(of(undefined));

    component.hostComponent = hostComponent;
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const linkDe = fixture.debugElement.query(
        By.directive(HathiTrustLinkComponent)
      );
      expect(linkDe).toBeFalsy();
      done();
    });
  });
});
