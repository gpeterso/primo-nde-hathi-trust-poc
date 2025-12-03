import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  InputSignal,
  OnInit,
} from '@angular/core';
import { Doc, DocDelivery } from '../search-result/search.model';
import { Observable, switchMap, filter, map } from 'rxjs';
import { HathiTrustService } from './hathi-trust.service';
import { AsyncPipe } from '@angular/common';
import { FullDisplayRecordFacade } from '../search-result/full-display-record.facade';
import { HathiTrustLinkComponent } from './hathi-trust-link/hathi-trust-link.component';
import { TranslateService } from '@ngx-translate/core';

interface NdeOnlineAvailability {
  searchResult: Doc;
  delivery: InputSignal<DocDelivery>;
  isFullDisplay: boolean;
}

function isLocal(doc: Doc): boolean {
  return doc.context === 'L';
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
  @Input() hostComponent!: NdeOnlineAvailability;
  fullTextUrl$?: Observable<string | undefined>;
  private hathiTrustService = inject(HathiTrustService);
  private fullDisplayRecordFacade = inject(FullDisplayRecordFacade);
  private translateService = inject(TranslateService);

  ngOnInit(): void {
    if (!this.isFullDisplay && isLocal(this.searchResult)) {
      this.fullTextUrl$ = this.findFullText({
        ...this.searchResult,
        delivery: this.delivery(),
      });
    } else {
      this.fullTextUrl$ =
        this.fullDisplayRecordFacade.currentRecordWithDelivery$.pipe(
          filter(isLocal),
          switchMap((record) => this.findFullText(record))
        );
    }
  }

  get availabilityText$() {
    return this.translateService.get(AVAILABILITY_TEXT_KEY).pipe(
      map((translation) => {
        return translation === AVAILABILITY_TEXT_KEY
          ? DEFAULT_AVAILABILITY_TEXT
          : translation;
      })
    );
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

  private findFullText(searchResult: Doc) {
    return this.hathiTrustService.findFullTextFor(searchResult);
  }
}
