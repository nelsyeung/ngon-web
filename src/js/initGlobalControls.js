import {
  clearPolygons,
  cloneSelected,
  removeSelected,
  selectPolygons,
} from './actions';

export default function (store) {
  const $clone = document.getElementById('clone');
  const $remove = document.getElementById('remove');
  const $clear = document.getElementById('clear');

  function cloneClick() {
    const uiState = store.getState().ui;
    const selected = uiState.selected.slice().map((id => id + uiState.selected.length));

    store.dispatch(cloneSelected(uiState.selected, uiState.scale));
    store.dispatch(selectPolygons(selected));
  }

  function removeClick() {
    const uiState = store.getState().ui;

    if (uiState.selected.length > 0) {
      store.dispatch(removeSelected(uiState.selected));
    }
  }

  function clearClick() {
    store.dispatch(clearPolygons());
  }

  $clone.onclick = () => cloneClick();
  $remove.onclick = () => removeClick();
  $clear.onclick = () => clearClick();
}
