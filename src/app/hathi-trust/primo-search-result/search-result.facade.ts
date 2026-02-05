import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectDeliveryEntities,
  selectFullDisplayWithDelivery,
  selectSearchEntities,
} from './search-result.selector';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
} from 'rxjs';
import { Doc } from './search.model';

@Injectable({
  providedIn: 'root',
})
export class SearchResultFacade {
  private store = inject(Store);

  readonly currentFullDisplay$: Observable<Doc> = this.store
    .select(selectFullDisplayWithDelivery)
    .pipe(
      filter((val) => val != null),
      distinctUntilChanged(),
    );

  getSearchResult(id: string): Observable<Doc> {
    return combineLatest({
      searchEntities: this.store.select(selectSearchEntities),
      deliveryEntities: this.store.select(selectDeliveryEntities),
    }).pipe(
      map(({ searchEntities, deliveryEntities }) => ({
        ...searchEntities[id],
        ...deliveryEntities[id],
      })),
      distinctUntilChanged(),
    );
  }
}
