import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  InputSignal,
  OnInit,
} from "@angular/core";
import { Doc, DocDelivery } from "./search.model";
import { Observable, switchMap, filter } from "rxjs";
import { HathiTrustService } from "./hathi-trust.service";
import { AsyncPipe } from "@angular/common";
import { FullDisplayRecordFacade } from "./full-display-record.facade";
import { HathiTrustLinkComponent } from "./hathi-trust-link/hathi-trust-link.component";

interface NdeOnlineAvailability {
  searchResult: Doc;
  delivery: InputSignal<DocDelivery>;
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
    console.log("DELIVERY SIGNAL: ", this.delivery());
    if (!this.isFullDisplay && isLocal(this.searchResult)) {
      this.fullTextUrl$ = this.findFullText({...this.searchResult, delivery: this.delivery()});
    } else {
      this.fullTextUrl$ = this.fullDisplayRecordFacade.fullDisplayRecordWithDelivery$.pipe(
        filter(isLocal),
        switchMap((record) => this.findFullText(record))
      );
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

  private findFullText(searchResult: Doc) {
    return this.hathiTrustService.findFullTextFor(searchResult);
  }
}
