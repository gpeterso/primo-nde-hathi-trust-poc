import {
  HttpBackend,
  HttpClient,
  HttpContext,
  HttpContextToken,
} from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, tap, map } from "rxjs";
import {
  HathiTrustMultiIdResponse,
  HathiTrustQuery,
  HathiTrustResponse,
} from "./hathi-trust-api.model";
import { Doc } from "./search.model";

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

  find(query: HathiTrustQuery): Observable<HathiTrustResponse> {
    return this.http
      .get<HathiTrustMultiIdResponse>(BASE_URL + query)
      .pipe(map(responseExtractor(query)), map(HathiTrustResponse.of));
  }

  findFullText(query: HathiTrustQuery): Observable<string | undefined> {
    return this.find(query).pipe(map((r) => r.findFullViewUrl()));
  }

  findFullTextFor(searchResult: Doc) {
    const query = createQuery(searchResult);
    return this.findFullText(query);
  }
}

function createQuery(doc: Doc) {
  const oclc = getAddata(doc, "oclcid").flatMap(oclcFilter);
  const [isbn, issn] = getAddata(doc, "isbn", "issn");
  return new HathiTrustQuery({ oclc, isbn, issn });
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
