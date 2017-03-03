import { rotateSelected, setAngle } from './actions';

export default function (store) {
  const $angle = document.getElementById('angle');
  const $angleSlider = document.getElementById('angle-slider');
  const $angleDisplay = document.getElementById('angle-display');

  function dispatchRotate(angle) {
    const storeState = store.getState();

    $angleDisplay.innerHTML = `${angle}°`;
    store.dispatch(
      rotateSelected(storeState.ui.selected, angle - storeState.ui.angle));
    store.dispatch(setAngle(angle));
  }

  function angleSliderChange() {
    const angle = $angleSlider.value;
    $angle.value = angle;
    dispatchRotate(angle);
  }

  function angleChange() {
    if ($angle.readOnly) {
      return;
    }

    const angle = $angle.value;
    $angleSlider.value = angle;
    dispatchRotate(angle);
  }

  $angleSlider.value = $angle.value;
  $angleDisplay.innerHTML = `${$angle.value}°`;

  $angleSlider.onchange = () => angleSliderChange();
  $angleSlider.oninput = () => angleSliderChange();
  $angle.onkeyup = () => angleChange();
}
