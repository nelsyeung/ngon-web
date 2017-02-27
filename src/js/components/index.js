import assign from 'core-js/fn/object/assign';

export default class {
  constructor(store) {
    this.state = {};
    this.store = store;
  }

  setState(change) {
    this.state = assign({}, this.state, change);
  }
}
