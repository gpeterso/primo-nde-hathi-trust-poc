import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, map, of } from "rxjs";
import {
  HathiTrustMultiIdResponse,
  HathiTrustQuery,
  HathiTrustResponse,
  HathiTrustQueryId,
} from "./hathi-trust-api.model";
import { Doc } from "./search.model";
import { HathiTrustConfigService } from "./hathi-trust-config.service";

const BASE_URL = "https://catalog.hathitrust.org/api/volumes/brief/json/";

const responseExtractor =
  (query: HathiTrustQuery) =>
  (response: HathiTrustMultiIdResponse): HathiTrustResponse =>
    response[query.toString()];

@Injectable({
  providedIn: "root",
})
export class HathiTrustService {
  private http: HttpClient = inject(HttpClient);
  private conifg = inject(HathiTrustConfigService);

  find(query: HathiTrustQuery): Observable<HathiTrustResponse> {
    return this.http
      .get<HathiTrustMultiIdResponse>(BASE_URL + query)
      .pipe(map(responseExtractor(query)), map(HathiTrustResponse.of));
  }

  findFullText(query: HathiTrustQuery): Observable<string | undefined> {
    return this.find(query).pipe(
      map((r) =>
        // r.findFullViewUrl({ ignoreCopyright: this.conifg.ignoreCopyright })
        r.findFullViewUrl({ ignoreCopyright: true })
      )
    );
  }

  findFullTextFor(searchResult: Doc) {
    console.log("HathiTrustService.findFullTextFor ", searchResult);
    let query: HathiTrustQuery | undefined;
    if (
      this.isEligible(searchResult) &&
      (query = this.createQuery(searchResult))
    ) {
      return this.findFullText(query);
    } else {
      return of(undefined);
    }
  }

  private isEligible(doc: Doc): boolean {
    return !(
      this.conifg.disableWhenAvailableOnline && hasOnlineAvailability(doc)
    );
  }

  private createQuery(doc: Doc) {
    const ids: { [key in HathiTrustQueryId]?: string[] } = {};
    if (this.conifg.matchOn.oclc)
      ids.oclc = getAddata(doc, "oclcid").flatMap(oclcFilter);
    if (this.conifg.matchOn.isbn) [ids.isbn] = getAddata(doc, "isbn");
    if (this.conifg.matchOn.issn) [ids.issn] = getAddata(doc, "issn");
    if (Object.values(ids).some((arr) => arr?.length > 0)) {
      return new HathiTrustQuery(ids);
    } else {
      return undefined;
    }
  }
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

// TODO: FIX. The delivery prop does not exist. Likely, we'll need to grab it from the store.
function hasOnlineAvailability(doc: Doc): boolean {
  return doc.delivery.GetIt1.some((getit) =>
    getit.links.some((link) => link.isLinktoOnline)
  );
}
