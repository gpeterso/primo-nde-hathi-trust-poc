import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HathiTrustComponent } from './hathi-trust.component';

describe('HathiTrustComponent', () => {
  let component: HathiTrustComponent;
  let fixture: ComponentFixture<HathiTrustComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HathiTrustComponent]
    });
    fixture = TestBed.createComponent(HathiTrustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
