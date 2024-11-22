import { Component, OnInit } from '@angular/core';
import { HathiTrustQuery, HathiTrustResponse } from './hathi-trust.model';
import { Doc } from '../nde/models/search.model';
import { Observable, map } from 'rxjs';
import { HathiTrustService } from './hathi-trust.service';

const config = {
  diableWhenAvailableOnline: true,
  ignoreCopyright: false,
  // TODO: maybe just look up all by default?
  matchOn: {
    oclc: true,
    isbn: false,
    issb: false,
    lccn: false,
  },
};

// TODO: consider adding the links to the store

@Component({
  selector: 'custom-hathi-trust',
  templateUrl: './hathi-trust.component.html',
  styleUrls: ['./hathi-trust.component.scss'],
})
export class HathiTrustComponent implements OnInit {
  searchResult!: Doc; // injected by SearchResultItemContainerComponent
  resultNumber!: number; // injected by SearchResultItemContainerComponent
  fullTextUrl$?: Observable<string | undefined>;

  constructor(private hathiTrustService: HathiTrustService) {}

  ngOnInit(): void {
    this.findFullText();
  }

  private findFullText() {
    //    const oclcNums = getOclcNums(this.searchResult);
    const query = createQuery(this.searchResult);
    //if (oclcNums) {
    //  const query = new HathiTrustQuery({ oclc: oclcNums });
    this.fullTextUrl$ = this.hathiTrustService
      .find(query)
      .pipe(map((r) => r.findFullViewUrl()));
    //}
  }
}

function createQuery(doc: Doc) {
  const oclc = getOclcNums(doc);
  const [isbn, issn, lccn] = ['isbn', 'issn', 'lccn'].map(
    (id) => doc.pnx.addata[id] ?? []
  );
  return new HathiTrustQuery({ oclc, isbn, issn, lccn });
}

function removeSystemControllPrefix(s: string): string {
  return s.replace(/\([a-zA-Z]+\)/, '');
}

function getOclcNums(doc: Doc): string[] {
  return doc.pnx.addata['oclcid']?.map(removeSystemControllPrefix) ?? [];
}

/*
function hasOnlineAvailability(doc: Doc): boolean {
  //doc.pnx.delivery.
}
*/
