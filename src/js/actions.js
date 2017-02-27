function createAction(type, ...argNames) {
  return (...args) => {
    const action = { type };

    argNames.forEach((arg, i) => {
      action[argNames[i]] = args[i];
    });

    return action;
  };
}

export const addPolygon = createAction('ADD_POLYGON', 'polygon');
export const clearPolygons = createAction('CLEAR_POLYGONS');
export const cloneSelected = createAction('CLONE_SELECTED', 'ids', 'scale');
export const highlightPolygon = createAction('HIGHLIGHT_POLYGON', 'id');
export const pushPolygonsToTop = createAction('PUSH_POLYGONS_TO_TOP', 'ids');
export const removeSelected = createAction('REMOVE_SELECTED', 'ids');
export const rotateSelected = createAction('ROTATE_SELECTED', 'ids', 'angle');
export const selectPolygons = createAction('SELECT_POLYGONS', 'ids');
export const setAngle = createAction('SET_ANGLE', 'angle');
export const translatePolygon = createAction('TRANSLATE_POLYGON', 'id', 'vector');
export const zoom = createAction('ZOOM', 'zoom');
