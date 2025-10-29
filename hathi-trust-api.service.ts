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
export class HathiTrustApiService {
  private http: HttpClient = inject(HttpClient);
  private conifg = inject(HathiTrustConfigService);

  find(query: HathiTrustQuery): Observable<HathiTrustResponse> {
    return this.http
      .get<HathiTrustMultiIdResponse>(BASE_URL + query)
      .pipe(map(responseExtractor(query)), map(HathiTrustResponse.of));
  }

  findFullTextUrl(query: HathiTrustQuery): Observable<string | undefined> {
    return this.find(query).pipe(
      map((hathiTrustResponse) =>
        hathiTrustResponse.findFullViewUrl({
          ignoreCopyright: this.conifg.ignoreCopyright,
        })
      )
    );
  }
}
