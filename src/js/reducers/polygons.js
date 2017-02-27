import createReducer from './createReducer';

function addPolygon(state, action) {
  return state.concat(action.polygon);
}

function cloneSelected(state, action) {
  const selected = state.filter((_, index) => action.ids.indexOf(index) !== -1).map(
    polygon => polygon.clone());
  const translation = 10 / action.scale;

  selected.forEach((polygon, index) => {
    selected[index].translate([translation, translation]);
  });

  return state.concat(selected);
}

function clearPolygons() {
  return [];
}

function pushPolygonsToTop(state, action) {
  const top = [];

  action.ids.forEach((id) => {
    top.push(state[id]);
  });

  return state.filter((polygon, index) => (action.ids.indexOf(index) === -1)).concat(top);
}

function removeSelected(state, action) {
  return state.filter((polygon, index) => action.ids.indexOf(index) === -1);
}

function rotateSelected(state, action) {
  if (isNaN(action.angle)) {
    return state;
  }

  const x = [];
  const y = [];
  const newState = state.slice();

  action.ids.forEach((id) => {
    state[id].coords.forEach((c) => {
      x.push(c[0]);
      y.push(c[1]);
    });
  });

  const center = [(Math.max(...x) + Math.min(...x)) / 2, (Math.max(...y) + Math.min(...y)) / 2];

  action.ids.forEach((id) => {
    newState[id].rotate(action.angle * (Math.PI / 180), center);
  });

  return newState;
}

function translatePolygon(state, action) {
  const newState = state.slice();
  newState[action.id].translate(action.vector);
  return newState;
}

export default createReducer([], {
  ADD_POLYGON: addPolygon,
  CLONE_SELECTED: cloneSelected,
  CLEAR_POLYGONS: clearPolygons,
  PUSH_POLYGONS_TO_TOP: pushPolygonsToTop,
  REMOVE_SELECTED: removeSelected,
  ROTATE_SELECTED: rotateSelected,
  TRANSLATE_POLYGON: translatePolygon,
});
