import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  Input,
  OnChanges,
  OnInit,
  Signal,
  signal,
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
  distinctUntilChanged,
  distinct,
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
export class HathiTrustComponent implements OnInit, OnChanges {
  //  @Input({ required: true }) private hostComponent!: {searchResult: Doc};
  //readonly hostComponent: any = input();
  @Input() hostComponent!: any;
  private store = inject(Store);
  private hathiTrustService = inject(HathiTrustService);
  //  private fullTextSubject = new BehaviorSubject<string | undefined>(undefined);
  protected fullTextUrl$?: Observable<string | undefined>;
  protected fullDisplayRecord$?: Observable<Doc | undefined>;
  //  protected fullTextUrl$ = this.fullTextSubject.asObservable();
  //protected fullTextUrl = signal<string | undefined>(undefined);
  protected fullDisplayRecordId$?: Observable<any>;
  private fullDisplayRecordFacade = inject(FullDisplayRecordFacade);
  private router = inject(Router);
  //private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location);
  //private searchResult?: Doc; // = this.hostComponent.searchResult;

  constructor() {
    //const srs: Signal<Doc> = this.hostComponent.searchResultSignal;
    effect(() =>
      console.log("EFFECT: ", this.hostComponent?.searchResultSignal?.())
    );
    /*
    effect(() => {
      const searchResult = this.hostComponent?.searchResultSignal?.();
      //if (isLocal(searchResult)) this.findFullText(searchResult);
      console.log("EFFECT: ", searchResult)
    });
    */
  }

  ngOnChanges(changes: any) {
    //console.log("CHANGES: ", changes);
  }

  ngOnInit(): void {
    if (!this.hostComponent.isFullDisplay && isLocal(this.searchResult)) {
      this.fullTextUrl$ = this.findFullText();
    } else {
      this.fullTextUrl$ = this.fullDisplayRecordFacade.fullDisplayRecord$.pipe(
        filter(isLocal),
        switchMap(record => this.findFullText(record))
      )
    }
    //console.log("HOST: ", this.hostComponent);
    /*
    this.fullDisplayRecordFacade.fullDisplayRecord$
      .pipe(
        //filter((rec) => rec["@id"] == this.hostComponent.searchResultSignal()["@id"]),
        tap((rec) => {
          //console.log("NEW REC FOR COMPONENT: ", this)
          if (this.hostComponent.isFullDisplay) {
          //if (this.hostComponent.isFullDisplay && rec["@id"] == this.hostComponent.searchResult["@id"]) {
            if (isLocal(rec)) this.findFullText(rec);
            console.log(
              "RX CHANGE [this, rec]: ",
              this,
              rec
              //this.hostComponent?.searchResultSignal?.()
            );
          }
        })
      )
      .subscribe();
    /*
    this.location.onUrlChange((url, state) =>
      console.log("URL CHANGE: ", url, state)
    );
    this.location.subscribe((state) =>
      console.log("POP STATE CHANGE: ", state)
    );
    */
    //this.router.events.subscribe(e => console.log("ROUTER EVENT: ", e))
    //this.activatedRoute.params.subscribe(p => console.log("PARAM CHANGE: ", p))

    //this.fullDisplayRecordFacade.fullDisplayRecord$.pipe(tap(() => console.log("SIGNAL: ", this.searchResult))).subscribe(id => console.log("ID: ", id))

    /*
    this.fullDisplayRecordId$ = this.store.select(fullDisplayRecordId);

    this.fullDisplayRecordId$
    //.pipe(distinctUntilChanged())
    //.pipe(distinct())
    .subscribe(id => console.log("ID: ", id))
    */

    /*
    this.fullDisplayRecord$ = this.store.select(selectFullDisplayRecord);
    //console.debug("HT: ", this)
    this.fullDisplayRecord$.subscribe((record) => {
      console.debug("FDR: ", record)
      if (record) {
        if (isLocal(record)) {
          this.findFullText(record);
        } else {
          this.fullTextUrl.set(undefined);
        }
      }
    });
    */
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

  private findFullText(doc: Doc = this.searchResult) {
    const query = createQuery(doc);
    return this.hathiTrustService
      .find(query)
      .pipe(
        map((r) => r.findFullViewUrl()),
        //tap((url) => this.fullTextUrl.set(url))
      )
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
