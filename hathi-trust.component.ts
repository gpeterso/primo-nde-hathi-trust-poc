import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  Input,
  OnChanges,
  OnInit,
} from "@angular/core";
import { HathiTrustQuery, HathiTrustResponse } from "./hathi-trust.model";
import { Doc } from "./search.model";
import {
  Observable,
  map,
  switchMap,
  filter,
} from "rxjs";
import { HathiTrustService } from "./hathi-trust.service";
import { AsyncPipe, CommonModule, Location } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import {
  fullDisplayRecordId,
  selectFullDisplayRecord,
} from "./full-display.selector";
import { Store } from "@ngrx/store";
import { FullDisplayRecordFacade } from "./full-display-record-facade.service";
import { ActivatedRoute, Router } from "@angular/router";

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

@Component({
  standalone: true,
  imports: [AsyncPipe, MatButtonModule, CommonModule],
  selector: "custom-hathi-trust",
  templateUrl: "./hathi-trust.component.html",
  styleUrls: ["./hathi-trust.component.scss"],
  //  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HathiTrustComponent implements OnInit {
  //  @Input({ required: true }) private hostComponent!: {searchResult: Doc};
  @Input() hostComponent!: any;
  private hathiTrustService = inject(HathiTrustService);
  private fullDisplayRecordFacade = inject(FullDisplayRecordFacade);
  protected fullTextUrl$?: Observable<string | undefined>;

  ngOnInit(): void {
    if (!this.hostComponent.isFullDisplay && isLocal(this.searchResult)) {
      this.fullTextUrl$ = this.findFullText(this.searchResult);
    } else {
      this.fullTextUrl$ = this.fullDisplayRecordFacade.fullDisplayRecord$.pipe(
        filter(isLocal),
        switchMap((record) => this.findFullText(record))
      );
    }
  }

  private get searchResult(): Doc {
    if ("searchResult" in this.hostComponent) {
      return this.hostComponent.searchResultSignal?.() as Doc;
    } else {
      throw new Error(
        `Missing expected searchResult in hostComponent: ${this.hostComponent}`
      );
    }
  }

  private findFullText(doc: Doc) {
    const query = createQuery(doc);
    return this.hathiTrustService.find(query).pipe(
      map((r) => r.findFullViewUrl())
    );
  }
}

function createQuery(doc: Doc) {
  const oclc = getAddata(doc, "oclcid").flatMap(oclcFilter);
  const [isbn, issn] = getAddata(doc, "isbn", "issn");
  return new HathiTrustQuery({ oclc, isbn, issn });
}

function isLocal(doc: Doc): boolean {
  return doc.context === "L";
}

// some institutions have a leading ocm|ocn|on without "(OCoLC)" prefix
const OCLC_PATTERN = /^(?:\(ocolc\)|(?:ocm|ocn|on))(?<id>\w+)/i;

function isOclcNum(s: string): boolean {
  return OCLC_PATTERN.test(s);
}

function extractOclcNum(s: string): string | undefined {
  return OCLC_PATTERN.exec(s)?.groups?.["id"];
}

function oclcFilter(ids: string[]): string[] {
  return ids.filter(isOclcNum).map(extractOclcNum) as string[];
}

function getAddata(doc: Doc, ...vals: string[]): string[][] {
  return vals.map((v) => doc.pnx.addata[v] ?? []);
}

/*
function hasOnlineAvailability(doc: Doc): boolean {
  //doc.pnx.delivery.
}
*/
