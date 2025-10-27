import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import {
  fullDisplayRecordId,
  selectFullDisplayRecord,
  selectFullDisplayWithDelivery,
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
      .pipe(
        share(),
        filter(val => val != null),
        distinctUntilKeyChanged("@id"),
      );
  }

  get fullDisplayRecordWithDelivery$() {
    return this.store
      .select(selectFullDisplayWithDelivery)
      .pipe(
        share(),
        filter(val => val != null),
        distinctUntilKeyChanged("@id"),
      );
  }
}
