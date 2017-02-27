import { assign } from 'core-js/es6/object';
import createReducer from './createReducer';

function highlightPolygon(state, action) {
  return assign({}, state, {
    highlighted: action.id,
  });
}

function selectPolygons(state, action) {
  return assign({}, state, {
    selected: action.ids,
  });
}

function setAngle(state, action) {
  return assign({}, state, {
    angle: action.angle,
  });
}

function zoom(state, action) {
  const scale = state.scale + action.zoom;

  return assign({}, state, {
    scale: (scale <= 1) ? 1 : scale,
  });
}

export default createReducer({
  angle: 0,
  hightlighted: -1,
  scale: 50,
  selected: [],
}, {
  HIGHLIGHT_POLYGON: highlightPolygon,
  SELECT_POLYGONS: selectPolygons,
  SET_ANGLE: setAngle,
  ZOOM: zoom,
});
