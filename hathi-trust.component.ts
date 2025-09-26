import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  Input,
  OnInit,
} from "@angular/core";
import { HathiTrustQuery, HathiTrustResponse } from "./hathi-trust.model";
import { Doc } from "./search.model";
import {
  Observable,
  map,
  tap,
  combineLatest,
  zip,
  Subject,
  BehaviorSubject,
} from "rxjs";
import { HathiTrustService } from "./hathi-trust.service";
import { AsyncPipe, CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { selectFullDisplayRecord } from "./full-display.selector";
import { Store } from "@ngrx/store";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HathiTrustComponent implements OnInit {
  //  @Input({ required: true }) private hostComponent!: {searchResult: Doc};
  //readonly hostComponent: any = input();
  @Input() hostComponent!: any;
  private store = inject(Store);
  private hathiTrustService = inject(HathiTrustService);
  private fullTextSubject = new BehaviorSubject<string | undefined>(undefined);
  //protected fullTextUrl$?: Observable<string | undefined>;
  protected fullDisplayRecord$?: Observable<Doc | undefined>;
  protected fullTextUrl$ = this.fullTextSubject.asObservable();

  ngOnInit(): void {
    if (isLocal(this.searchResult)) this.findFullText();
    this.fullDisplayRecord$ = this.store.select(selectFullDisplayRecord);
    //console.debug("HT: ", this)
    this.fullDisplayRecord$.subscribe((record) => {
      if (record) {
        if (isLocal(record)) {
          this.findFullText(record);
        } else {
          this.fullTextSubject.next(undefined);
        }
      }
    });
  }

  private get searchResult(): Doc {
    if ("searchResult" in this.hostComponent) {
      return this.hostComponent.searchResult as Doc;
    } else {
      throw new Error(
        `Missing expected searchResult in hostComponent: ${this.hostComponent}`
      );
    }
  }

  private findFullText(doc = this.searchResult) {
    const query = createQuery(doc);
    this.hathiTrustService
      .find(query)
      .pipe(
        map((r) => r.findFullViewUrl()),
        map((url) => this.fullTextSubject.next(url))
      )
      .subscribe();
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
