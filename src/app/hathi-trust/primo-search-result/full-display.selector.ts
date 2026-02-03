import { createFeatureSelector, createSelector } from '@ngrx/store';

interface FullDisplayState {
  selectedRecordId: string | null;
}

interface SearchState {
  entities: { [key: string]: any };
}

interface DeliveryState {
  entities: { [key: string]: any };
}

const fullDisplay = createFeatureSelector<FullDisplayState>('full-display');
const searchFeature = createFeatureSelector<SearchState>('Search');
const deliveryFeature = createFeatureSelector<DeliveryState>('Delivery');

export const fullDisplayRecordId = createSelector(
  fullDisplay,
  (fullDisplay) => fullDisplay?.selectedRecordId ?? null
);

export const selectFullDisplayRecord = createSelector(
  fullDisplayRecordId,
  searchFeature,
  (recordId: string | null, searchState: SearchState) =>
    recordId ? searchState.entities[recordId] : null
);

export const selectFullDisplayWithDelivery = createSelector(
  fullDisplayRecordId,
  selectFullDisplayRecord,
  deliveryFeature,
  (recordId: string | null, record: any, deliveryState: DeliveryState) => {
    if (recordId && record) {
      const delivery = deliveryState.entities[recordId];
      return { ...record, ...delivery };
    }
    return null;
  }
);
