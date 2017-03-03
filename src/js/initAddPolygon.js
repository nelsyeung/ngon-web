import * as ngon from 'ngon';
import { addPolygon } from './actions';

export default function (store) {
  const $addPolygon = document.getElementById('add-polygon');
  const $sides = document.getElementById('sides');
  const $length = document.getElementById('length');
  const $radius = document.getElementById('radius');
  const state = {
    lastChange: 'length',
  };

  function sidesChange() {
    const sides = $sides.value;

    if (state.lastChange === 'length') {
      const radius = ngon.lengthToRadius(sides, $length.value);

      if (!isNaN(radius)) {
        $radius.value = radius.toFixed(6);
      }
    } else {
      const length = ngon.radiusToLength(sides, $radius.value);

      if (!isNaN(length)) {
        $length.value = length.toFixed(6);
      }
    }
  }

  function lengthChange(e) {
    const charCode = e.which || e.keyCode;
    let radius = ngon.lengthToRadius($sides.value, $length.value);

    if (isNaN(radius)) {
      radius = $radius.value;
    }

    $radius.value = radius.toFixed(6);

    if (charCode !== 9) { // tab
      state.lastChange = 'length';
    }
  }

  function radiusChange(e) {
    const charCode = e.which || e.keyCode;
    let length = ngon.radiusToLength($sides.value, $radius.value);

    if (isNaN(length)) {
      length = $length.value;
    }

    $length.value = length.toFixed(6);

    if (charCode !== 9) { // tab
      state.lastChange = 'radius';
    }
  }

  function addPolygonSubmit(e) {
    e.preventDefault();
    store.dispatch(addPolygon(new ngon.RegularPolygon($sides.value, $length.value)));
  }

  $radius.value = ngon.lengthToRadius($sides.value, $length.value).toFixed(6);
  $sides.onchange = () => sidesChange();
  $sides.onkeyup = () => sidesChange();
  $length.addEventListener('keyup', lengthChange);
  $radius.addEventListener('keyup', radiusChange);
  $addPolygon.addEventListener('submit', addPolygonSubmit);
}
