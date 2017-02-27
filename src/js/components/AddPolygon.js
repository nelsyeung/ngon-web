import * as ngon from 'ngon';
import Component from '.';
import { addPolygon } from '../actions';

export default class AddPolygon extends Component {
  constructor(store) {
    super(store);
    this.$addPolygon = document.getElementById('add-polygon');
    this.$sides = document.getElementById('sides');
    this.$length = document.getElementById('length');
    this.$radius = document.getElementById('radius');
    this.state = {
      lastChange: 'length',
    };

    this.$radius.value = ngon.lengthToRadius(this.$sides.value, this.$length.value).toFixed(6);
    this.$sides.onchange = () => this.sidesChange();
    this.$sides.onkeyup = () => this.sidesChange();
    this.$length.addEventListener('keyup', e => this.lengthChange(e));
    this.$radius.addEventListener('keyup', e => this.radiusChange(e));
    this.$addPolygon.addEventListener('submit', e => this.addPolygonSubmit(e));
  }

  sidesChange() {
    const sides = this.$sides.value;

    if (this.state.lastChange === 'length') {
      const radius = ngon.lengthToRadius(sides, this.$length.value);

      if (!isNaN(radius)) {
        this.$radius.value = radius.toFixed(6);
      }
    } else {
      const length = ngon.radiusToLength(sides, this.$radius.value);

      if (!isNaN(length)) {
        this.$length.value = length.toFixed(6);
      }
    }
  }

  lengthChange(e) {
    const charCode = e.which || e.keyCode;
    let radius = ngon.lengthToRadius(this.$sides.value, this.$length.value);

    if (isNaN(radius)) {
      radius = this.$radius.value;
    }

    this.$radius.value = radius.toFixed(6);

    if (charCode !== 9) { // tab
      this.setState({
        lastChange: 'length',
      });
    }
  }

  radiusChange(e) {
    const charCode = e.which || e.keyCode;
    let length = ngon.radiusToLength(this.$sides.value, this.$radius.value);

    if (isNaN(length)) {
      length = this.$length.value;
    }

    this.$length.value = length.toFixed(6);

    if (charCode !== 9) { // tab
      this.setState({
        lastChange: 'radius',
      });
    }
  }

  addPolygonSubmit(e) {
    e.preventDefault();
    this.store.dispatch(addPolygon(new ngon.RegularPolygon(this.$sides.value, this.$length.value)));
  }
}
