import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Doc } from './primo-search-result/search.model';
import { Observable, switchMap, map, tap, iif, combineLatest, defer } from 'rxjs';
import { HathiTrustService } from './hathi-trust.service';
import { AsyncPipe } from '@angular/common';
import { SearchResultFacade } from './primo-search-result/search-result.facade';
import { HathiTrustLinkComponent } from './hathi-trust-link/hathi-trust-link.component';
import { TranslateService } from '@ngx-translate/core';

interface NdeOnlineAvailability {
  searchResult: Doc;
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
export class HathiTrustComponent {
  private hathiTrustService = inject(HathiTrustService);
  private searchResultFacade = inject(SearchResultFacade);
  private translateService = inject(TranslateService);
  @Input() hostComponent!: NdeOnlineAvailability;
  fullTextUrl$: Observable<string | undefined> = this.findFullText();
  availabilityText$: Observable<string> = this.translateService
    .get(AVAILABILITY_TEXT_KEY)
    .pipe(
      map((translation) => {
        return translation === AVAILABILITY_TEXT_KEY
          ? DEFAULT_AVAILABILITY_TEXT
          : translation;
      }),
    );

  private findFullText(): Observable<string | undefined> {
    return iif(
      () => this.isFullDisplay,
      this.searchResultFacade.currentFullDisplay$,
      defer(() => this.searchResultFacade.getSearchResult(this.recordId)),
    ).pipe(
      switchMap((record) => this.hathiTrustService.findFullTextFor(record)),
    );
  }

  private get isFullDisplay(): boolean {
    return this.hostComponent.isFullDisplay;
  }

  private get recordId(): string {
    return this.hostComponent.searchResult.pnx.control.recordid[0];
  }
}
