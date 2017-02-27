import Component from '.';
import { rotateSelected, setAngle } from '../actions';

export default class RotationControl extends Component {
  constructor(store) {
    super(store);
    this.$angle = document.getElementById('angle');
    this.$angleSlider = document.getElementById('angle-slider');
    this.$angleDisplay = document.getElementById('angle-display');

    this.$angleSlider.value = this.$angle.value;
    this.$angleDisplay.innerHTML = `${this.$angle.value}°`;

    this.$angleSlider.onchange = () => this.angleSliderChange();
    this.$angleSlider.oninput = () => this.angleSliderChange();
    this.$angle.onkeyup = () => this.angleChange();
  }

  angleSliderChange() {
    const angle = this.$angleSlider.value;
    this.$angle.value = angle;
    this.dispatchRotate(angle);
  }

  angleChange() {
    if (this.$angle.readOnly) {
      return;
    }

    const angle = this.$angle.value;
    this.$angleSlider.value = angle;
    this.dispatchRotate(angle);
  }

  dispatchRotate(angle) {
    const storeState = this.store.getState();

    this.$angleDisplay.innerHTML = `${angle}°`;
    this.store.dispatch(
      rotateSelected(storeState.ui.selected, angle - storeState.ui.angle));
    this.store.dispatch(setAngle(angle));
  }
}
