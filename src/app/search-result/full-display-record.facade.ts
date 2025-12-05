import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectFullDisplayRecord,
  selectFullDisplayWithDelivery,
} from './full-display.selector';
import { distinctUntilKeyChanged, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FullDisplayRecordFacade {
  private store = inject(Store);

  currentRecord$ = this.store.select(selectFullDisplayRecord).pipe(
    filter((val) => val != null),
    distinctUntilKeyChanged('@id')
  );

  currentRecordWithDelivery$ = this.store
    .select(selectFullDisplayWithDelivery)
    .pipe(
      filter((val) => val != null),
      distinctUntilKeyChanged('@id')
    );
}
