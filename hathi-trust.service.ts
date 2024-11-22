import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import {
  HathiTrustMultiIdResponse,
  HathiTrustQuery,
  HathiTrustResponse,
} from './hathi-trust.model';

const BASE_URL = 'https://catalog.hathitrust.org/api/volumes/brief/json/';

const responseExtractor =
  (query: HathiTrustQuery) =>
  (response: HathiTrustMultiIdResponse): HathiTrustResponse =>
    response[query.toString()];

@Injectable({
  providedIn: 'root',
})
export class HathiTrustService {
  private http: HttpClient;

  constructor(httpBackend: HttpBackend) {
    this.http = new HttpClient(httpBackend);
  }

  find(query: HathiTrustQuery): Observable<HathiTrustResponse> {
    return this.http
      .get<HathiTrustMultiIdResponse>(BASE_URL + query)
      .pipe(map(responseExtractor(query)), map(HathiTrustResponse.of));
  }
}
