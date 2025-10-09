import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from "@angular/core";
import { Doc } from "./search.model";
import { Observable, switchMap, filter } from "rxjs";
import { HathiTrustService } from "./hathi-trust.service";
import { AsyncPipe } from "@angular/common";
import { FullDisplayRecordFacade } from "./full-display-record.facade";
import { HathiTrustLinkComponent } from "./hathi-trust-link/hathi-trust-link.component";

const config = {
  diableWhenAvailableOnline: true,
  ignoreCopyright: false,
  // TODO: maybe just look up all by default?
  matchOn: {
    oclc: true,
    isbn: false,
    issb: false,
  },
};

interface NdeOnlineAvailability {
  searchResult: Doc;
  isFullDisplay: boolean;
}

function isLocal(doc: Doc): boolean {
  return doc.context === "L";
}

@Component({
  standalone: true,
  imports: [AsyncPipe, HathiTrustLinkComponent],
  selector: "custom-hathi-trust",
  template: `
    @if (fullTextUrl$ | async; as url) { 
      <custom-hathi-trust-link [url]="url" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HathiTrustComponent implements OnInit {
  @Input() hostComponent!: NdeOnlineAvailability;
  private hathiTrustService = inject(HathiTrustService);
  private fullDisplayRecordFacade = inject(FullDisplayRecordFacade);
  protected fullTextUrl$?: Observable<string | undefined>;

  ngOnInit(): void {
    if (!this.isFullDisplay && isLocal(this.searchResult)) {
      this.fullTextUrl$ = this.findFullText(this.searchResult);
    } else {
      this.fullTextUrl$ = this.fullDisplayRecordFacade.fullDisplayRecord$.pipe(
        filter(isLocal),
        switchMap((record) => this.findFullText(record))
      );
    }
  }

  private get isFullDisplay() {
    return this.hostComponent.isFullDisplay;
  }

  private get searchResult() {
    return this.hostComponent.searchResult;
  }

  private findFullText(searchResult: Doc) {
    return this.hathiTrustService.findFullTextFor(searchResult);
  }
}
