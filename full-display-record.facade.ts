import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import {
  fullDisplayRecordId,
  selectFullDisplayRecord,
} from "./full-display.selector";
import { distinctUntilChanged, distinctUntilKeyChanged, filter, share } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FullDisplayRecordFacade {
  private store = inject(Store);

  get fullDisplayRecord$() {
    return this.store
      .select(selectFullDisplayRecord)
      //.pipe(share(), distinctUntilChanged());
      .pipe(
        share(),
        filter(val => val != null),
        distinctUntilKeyChanged("@id"),
      );
  }
}
