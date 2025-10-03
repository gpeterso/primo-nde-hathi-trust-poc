import { createFeatureSelector, createSelector } from "@ngrx/store";

interface FullDisplayState {
  selectedRecordId: string | null;
}

interface SearchState {
  entities: { [key: string]: any };
}

const fullDisplay = createFeatureSelector<FullDisplayState>("full-display");
const searchFeature = createFeatureSelector<SearchState>("Search");

export const fullDisplayRecordId = createSelector(
  fullDisplay,
  (fullDisplay) => fullDisplay?.selectedRecordId ?? null
  //(fullDisplay) => fullDisplay.selectedRecordId
);

export const selectFullDisplayRecord = createSelector(
  fullDisplayRecordId,
  searchFeature,
  (recordId: string | null, searchState: SearchState) =>
    recordId ? searchState.entities[recordId] : null
);
