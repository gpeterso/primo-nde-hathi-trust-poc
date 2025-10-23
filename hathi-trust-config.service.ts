import { Inject, inject, Injectable } from "@angular/core";

interface HathiTrustModuleParameters {
  disableWhenAvailableOnline: boolean;
  ignoreCopyright: boolean;
  matchOn: {
    oclc: boolean;
    isbn: boolean;
    issn: boolean;
  };
}

@Injectable({
  providedIn: "root",
})
export class HathiTrustConfigService {
  constructor(
    @Inject("MODULE_PARAMETERS")
    private moduleParameters: HathiTrustModuleParameters
  ) {}

  get disableWhenAvailableOnline(): boolean {
    return this.moduleParameters.disableWhenAvailableOnline ?? true;
  }

  get ignoreCopyright(): boolean {
    return this.moduleParameters.ignoreCopyright ?? false;
  }

  get matchOn(): {
    oclc: boolean;
    isbn: boolean;
    issn: boolean;
  } {
    return this.moduleParameters.matchOn ?? {
      oclc: true,
      isbn: false,
      issn: false,
    };
  }
}
