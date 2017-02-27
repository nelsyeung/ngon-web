import Component from '.';
import {
  clearPolygons,
  cloneSelected,
  removeSelected,
  selectPolygons,
} from '../actions';

export default class GlobalControls extends Component {
  constructor(store) {
    super(store);
    this.$clone = document.getElementById('clone');
    this.$remove = document.getElementById('remove');
    this.$clear = document.getElementById('clear');

    this.$clone.onclick = () => this.cloneClick();
    this.$remove.onclick = () => this.removeClick();
    this.$clear.onclick = () => this.clearClick();
  }

  cloneClick() {
    const uiState = this.store.getState().ui;
    const selected = uiState.selected.slice().map((id => id + uiState.selected.length));

    this.store.dispatch(cloneSelected(uiState.selected, uiState.scale));
    this.store.dispatch(selectPolygons(selected));
  }

  removeClick() {
    const uiState = this.store.getState().ui;

    if (uiState.selected.length > 0) {
      this.store.dispatch(removeSelected(uiState.selected));
    }
  }

  clearClick() {
    this.store.dispatch(clearPolygons());
  }
}
