import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  InputSignal,
  OnInit,
} from '@angular/core';
import { Doc, DocDelivery } from './primo-search-result/search.model';
import { Observable, switchMap, map } from 'rxjs';
import { HathiTrustService } from './hathi-trust.service';
import { AsyncPipe } from '@angular/common';
import { FullDisplayRecordFacade } from './primo-search-result/full-display-record.facade';
import { HathiTrustLinkComponent } from './hathi-trust-link/hathi-trust-link.component';
import { TranslateService } from '@ngx-translate/core';

interface NdeOnlineAvailability {
  searchResult: Doc;
  delivery: InputSignal<DocDelivery>;
  isFullDisplay: boolean;
}

const AVAILABILITY_TEXT_KEY = 'HathiTrust.availabilityText';
const DEFAULT_AVAILABILITY_TEXT = 'Full text from HathiTrust';

@Component({
  standalone: true,
  selector: 'custom-hathi-trust',
  imports: [AsyncPipe, HathiTrustLinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (fullTextUrl$ | async; as url) {
    <custom-hathi-trust-link [url]="url">
      {{ availabilityText$ | async }}
    </custom-hathi-trust-link>
    }
  `,
})
export class HathiTrustComponent implements OnInit {
  private hathiTrustService = inject(HathiTrustService);
  private fullDisplayRecordFacade = inject(FullDisplayRecordFacade);
  private translateService = inject(TranslateService);
  @Input() hostComponent!: NdeOnlineAvailability;
  fullTextUrl$?: Observable<string | undefined>;

  availabilityText$: Observable<string> = this.translateService
    .get(AVAILABILITY_TEXT_KEY)
    .pipe(
      map((translation) => {
        return translation === AVAILABILITY_TEXT_KEY
          ? DEFAULT_AVAILABILITY_TEXT
          : translation;
      })
    );

  ngOnInit(): void {
    this.fullTextUrl$ = this.findFullText();
  }

  private findFullText(): Observable<string | undefined> {
    if (this.isFullDisplay) {
      return this.fullDisplayRecordFacade.currentRecordWithDelivery$.pipe(
        switchMap((record) => this.hathiTrustService.findFullTextFor(record))
      );
    } else {
      return this.hathiTrustService.findFullTextFor({
        ...this.searchResult,
        delivery: this.delivery(),
      });
    }
  }

  private get isFullDisplay(): boolean {
    return this.hostComponent.isFullDisplay;
  }

  private get searchResult(): Doc {
    return this.hostComponent.searchResult;
  }

  private get delivery(): InputSignal<DocDelivery> {
    return this.hostComponent.delivery;
  }
}
