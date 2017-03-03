import { createStore, applyMiddleware } from 'redux';
import * as ngon from 'ngon';
import '../scss/styles.scss';
import app from './reducers';
import {
  highlightPolygon,
  pushPolygonsToTop,
  removeSelected,
  selectPolygons,
  setAngle,
  translatePolygon,
  zoom,
} from './actions';
import Stage from './Stage';
import initAddPolygon from './initAddPolygon';
import initGlobalControls from './initGlobalControls';
import initRotationControl from './initRotationControl';

const $angle = document.getElementById('angle');
const $angleSlider = document.getElementById('angle-slider');
const $angleDisplay = document.getElementById('angle-display');
const $floatingAngleControl = document.getElementById('floating-angle-control');

let store = {};
let state = {};
const mouse = {
  prevX: 0,
  prevY: 0,
  x: 0,
  y: 0,
  down: false,
  dragged: false,
  selectionStart: [-1, -1],
  canvasFocus: false,
};
const stage = new Stage();

function arrayEqual(a1, a2) {
  if (!a2) {
    return false;
  }

  if (a1.length !== a2.length) {
    return false;
  }

  for (let i = 0, l = a1.length; i < l; i += 1) {
    if (a1[i] instanceof Array && a2[i] instanceof Array) {
      if (!a1[i].equals(a2[i])) {
        return false;
      }
    } else if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}

function drawAllPolygons() {
  stage.clearCanvas('bg');
  stage.clearCanvas('fg');

  state.polygons.forEach((polygon, index) => {
    stage.drawPolygon(polygon,
      (index === state.ui.highlighted || state.ui.selected.indexOf(index) !== -1));
  });
}

function disableRotationControl() {
  $angle.readOnly = true;
  $floatingAngleControl.style.display = 'none';
}

function enableRotationControl() {
  $angle.readOnly = false;
  $floatingAngleControl.style.display = 'block';
  $angle.value = 0;
  $angleSlider.value = 0;
  $angleDisplay.innerHTML = '0°';
  store.dispatch(setAngle(0));
}

function transform(c, axis = 'x') {
  const size = (axis === 'y') ? stage.$canvas.bg.height : stage.$canvas.bg.width;
  return (c - (size / 2)) / state.ui.scale;
}

function checkHighlighted() {
  let highlighted = -1;

  for (let i = state.polygons.length - 1; i >= 0; i -= 1) {
    const polygon = state.polygons[i];
    const transformed = [
      transform(mouse.x),
      transform(mouse.y, 'y'),
    ];

    if (polygon.contains(transformed[0], transformed[1])) {
      highlighted = i;
      break;
    }
  }

  if (highlighted !== state.ui.highlighted) {
    store.dispatch(highlightPolygon(highlighted));
  }
}

function selectPolygon() {
  const mouseTransformed = {
    x: transform(mouse.x),
    y: transform(mouse.y, 'y'),
  };
  let selected = -1;

  state.polygons.every((polygon, index) => {
    if (polygon.contains(mouseTransformed.x, mouseTransformed.y)) {
      selected = index;
      enableRotationControl();
      store.dispatch(highlightPolygon(-1));
      store.dispatch(pushPolygonsToTop([selected]));
      store.dispatch(selectPolygons([state.polygons.length - 1]));
      return false;
    }

    return true;
  });

  if (selected === -1) {
    disableRotationControl();
    store.dispatch(selectPolygons([]));
  }
}

function createSelection() {
  if (mouse.selectionStart[0] === -1) {
    mouse.selectionStart = [mouse.prevX, mouse.prevY];
  }

  const width = mouse.x - mouse.selectionStart[0];
  const height = mouse.y - mouse.selectionStart[1];
  const transformed = {
    mouse: {
      x: transform(mouse.x),
      y: transform(mouse.y, 'y'),
    },
    selectionStart: [
      transform(mouse.selectionStart[0]),
      transform(mouse.selectionStart[1], 'y'),
    ],
  };
  const selected = [];

  stage.drawSelection(mouse.selectionStart, width, height);

  state.polygons.forEach((polygon, index) => {
    const boundingBox = new ngon.CustomPolygon([
      [transformed.selectionStart[0], transformed.selectionStart[1]],
      [transformed.mouse.x, transformed.selectionStart[1]],
      [transformed.mouse.x, transformed.mouse.y],
      [transformed.selectionStart[0], transformed.mouse.y],
    ]);

    for (let i = 0; i < polygon.coords.length; i += 1) {
      if (boundingBox.contains(polygon.coords[i][0], polygon.coords[i][1])) {
        selected.push(index);
        break;
      }
    }
  });

  if (!arrayEqual(state.ui.selected, selected)) {
    store.dispatch(pushPolygonsToTop(selected));
    store.dispatch(selectPolygons(selected.map((polygon, index) =>
      state.polygons.length - (selected.length - index),
    )));

    if (selected.length > 0) {
      enableRotationControl();
    } else {
      disableRotationControl();
    }
  }
}

function dragPolygon(index) {
  const dv = [
    (mouse.x - mouse.prevX) / state.ui.scale,
    (mouse.y - mouse.prevY) / state.ui.scale,
  ];
  let dx = 0;
  let dy = 0;
  let snap = false;

  mouse.dragged = true;

  store.dispatch(translatePolygon(index, dv));

  // Only snap for single highlighted or single selected polygon
  if (state.ui.selected.length < 2) {
    // Compare the moving polygon coordinates with every other polygons coordinates for snap
    state.polygons[index].coords.every(c => (
      state.polygons.every((p, i) => {
        if (i === index) {
          return true;
        }

        return p.coords.every((pc) => {
          dx = pc[0] - c[0];
          dy = pc[1] - c[1];

          if (Math.abs(dx) + Math.abs(dy) < 5 / state.ui.scale) {
            snap = true;
            return false;
          }

          return true;
        });
      })
    ));

    if (snap) {
      store.dispatch(translatePolygon(index, [dx, dy]));
      dv[0] += dx;
      dv[1] += dy;
    }

    if (index !== state.polygons.length - 1) {
      store.dispatch(pushPolygonsToTop([index]));
      store.dispatch(highlightPolygon(state.polygons.length - 1));
    }
  }

  return dv;
}

function dragSelected() {
  let dv = [0, 0];

  state.ui.selected.forEach((id) => {
    dv = dragPolygon(id);
  });

  return dv;
}

function keydown(e) {
  if (mouse.canvasFocus) {
    const charCode = e.which || e.keyCode;

    if (state.ui.selected.length > 0 && charCode === 46) {
      e.preventDefault();
      store.dispatch(removeSelected(store.getState().ui.selected));
    }
  }
}

function wheel(e) {
  store.dispatch(zoom(e.deltaY / 5));
}

function mousemove(e) {
  mouse.prevX = mouse.x;
  mouse.prevY = mouse.y;
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  if (mouse.down) {
    if (state.ui.highlighted !== -1 && state.ui.selected.length === 0) {
      stage.moveSelected(dragPolygon(state.ui.highlighted));
    }

    if (state.ui.highlighted === -1) {
      createSelection();
    }

    if (mouse.selectionStart[0] === -1 &&
      state.ui.selected.length > 0 &&
      state.ui.selected.indexOf(state.ui.highlighted) !== -1) {
      stage.moveSelected(dragSelected());
    }
  } else {
    checkHighlighted();
  }
}

function mousedown(e) {
  mouse.down = true;
  mouse.dragged = false;
  mouse.canvasFocus = e.target === stage.$canvas.selection;
}

function mouseup(e) {
  const onCanvas = e.target === stage.$canvas.selection;

  mouse.down = false;

  if (!onCanvas) {
    mouse.canvasFocus = false;
  }

  if (mouse.selectionStart[0] === -1 && !mouse.dragged && onCanvas) {
    selectPolygon();
  }

  mouse.selectionStart = [-1, -1];
  stage.clearCanvas('selection');
}

const manageCanvas = () => next => (action) => {
  const result = next(action);

  switch (action.type) {
    case 'ADD_POLYGON':
      stage.drawPolygon(result.polygon);
      break;
    case 'CLEAR_POLYGONS':
      stage.clearCanvas('bg');
      stage.clearCanvas('fg');
      break;
    case 'REMOVE_SELECTED':
      disableRotationControl();
      stage.clearCanvas('fg');
      break;
    case 'SELECT_POLYGONS':
    case 'HIGHLIGHT_POLYGON':
      drawAllPolygons();
      stage.cache();
      break;
    case 'ZOOM':
      stage.scale = state.ui.scale;
      drawAllPolygons();
      break;
    case 'ROTATE_SELECTED':
      drawAllPolygons();
      break;
    default:
      break;
  }

  return result;
};

store = createStore(app, applyMiddleware(manageCanvas));
state = store.getState();
store.subscribe(() => {
  state = store.getState();
});

window.onresize = () => {
  stage.setCanvasSize();
  drawAllPolygons();
};

document.addEventListener('keydown', keydown);
stage.$main.addEventListener('wheel', wheel);
stage.$canvas.selection.addEventListener('mousemove', mousemove);
document.addEventListener('mousedown', mousedown);
document.addEventListener('mouseup', mouseup);

initAddPolygon(store);
initGlobalControls(store);
initRotationControl(store);
