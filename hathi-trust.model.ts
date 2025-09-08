export class HathiTrustQuery {
  readonly oclc: ReadonlyArray<string> | undefined;
  readonly isbn: ReadonlyArray<string> | undefined;
  readonly issn: ReadonlyArray<string> | undefined;

  constructor(query: Partial<HathiTrustQuery>) {
    this.validate(query);
    Object.assign(this, query);
  }

  toString(): string {
    return Object.entries(this)
      .flatMap(([key, values]) => values.map((val: string) => `${key}:${val}`))
      .join(';');
  }

  private validate(query: Partial<HathiTrustQuery>) {
    const validIds = ['oclc', 'isbn', 'issn'];
    const hasAtLeastOneId = validIds.some((id) => Object.hasOwn(query, id));
    if (!hasAtLeastOneId) {
      throw new Error(
        'HathiTrustQuery must have at least one of the following: ' +
          validIds.join(', ')
      );
    }
  }
}

export interface HathiTrustResponse {
  readonly records: { [id: string]: HathiTrustRecord };
  readonly items: HathiTrustItem[] | [];
}

export class HathiTrustResponse {
  static of(response: HathiTrustResponse) {
    return Object.assign(new HathiTrustResponse(), response);
  }

  findFullViewUrl(): string | undefined {
    const item = this.findFullViewItem();
    return item ? this.records[item.fromRecord].recordURL : undefined;
  }

  private findFullViewItem() {
    return this.items.find(
      (item) => item.usRightsString.toLowerCase() === 'full view'
    );
  }
}

export interface HathiTrustRecord {
  readonly recordURL: string;
  readonly titles: ReadonlyArray<string>;
  readonly isbns: ReadonlyArray<string>;
  readonly issns: ReadonlyArray<string>;
  readonly oclcs: ReadonlyArray<string>;
  readonly lccns: ReadonlyArray<string>;
}

export interface HathiTrustFullRecord extends HathiTrustRecord {
  readonly 'marc-xml': string;
}

export interface HathiTrustItem {
  readonly orig: string;
  readonly fromRecord: string;
  readonly htid: string;
  readonly itemURL: string;
  readonly rightsCode: string;
  readonly lastUpdate: string;
  readonly enumcron: string;
  readonly usRightsString: string;
}

export interface HathiTrustMultiIdResponse {
  readonly [ids: string]: HathiTrustResponse;
}
