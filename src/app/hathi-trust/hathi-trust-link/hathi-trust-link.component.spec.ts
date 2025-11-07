import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HathiTrustLinkComponent } from './hathi-trust-link.component';

describe('HathiTrustLinkComponent', () => {
  let component: HathiTrustLinkComponent;
  let fixture: ComponentFixture<HathiTrustLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HathiTrustLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HathiTrustLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
