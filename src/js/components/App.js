import { createStore, applyMiddleware } from 'redux';
import * as ngon from 'ngon';
import app from '../reducers';
import {
  highlightPolygon,
  pushPolygonsToTop,
  removeSelected,
  selectPolygons,
  setAngle,
  translatePolygon,
  zoom,
} from '../actions';
import AddPolygon from './AddPolygon';
import RotationControl from './RotationControl';
import GlobalControls from './GlobalControls';

export default class {
  constructor() {
    const manageCanvas = () => next => (action) => {
      const result = next(action);

      switch (action.type) {
        case 'ADD_POLYGON':
          this.drawPolygon(this.state.polygons[this.state.polygons.length - 1]);
          break;
        case 'CLEAR_POLYGONS':
        case 'CLONE_SELECTED':
        case 'HIGHLIGHT_POLYGON':
        case 'ROTATE_SELECTED':
        case 'SELECT_POLYGONS':
        case 'ZOOM':
          this.drawAllPolygons();
          break;
        case 'REMOVE_SELECTED':
          this.disableRotationControl();
          this.drawAllPolygons();
          break;
        default:
          break;
      }

      return result;
    };

    this.store = createStore(app, applyMiddleware(manageCanvas));
    this.$main = document.getElementById('main');
    this.$canvas = document.getElementById('canvas');
    this.$canvasTop = document.getElementById('canvas-top');
    this.$angle = document.getElementById('angle');
    this.$angleSlider = document.getElementById('angle-slider');
    this.$angleDisplay = document.getElementById('angle-display');
    this.$floatingAngleControl = document.getElementById('floating-angle-control');
    this.state = this.store.getState();
    this.ctx = this.$canvas.getContext('2d');
    this.ctxTop = this.$canvasTop.getContext('2d');
    this.mouse = {
      prevX: 0,
      prevY: 0,
      x: 0,
      y: 0,
      down: false,
      dragged: false,
      selectionStart: [-1, -1],
      canvasFocus: false,
    };

    this.store.subscribe(() => {
      this.state = this.store.getState();
    });

    this.setCanvasSize();
    window.onresize = () => {
      this.setCanvasSize();
      this.drawAllPolygons();
    };

    this.$canvasTop.addEventListener('wheel', e => this.wheel(e));
    this.$canvasTop.addEventListener('mousemove', e => this.mousemove(e));
    document.addEventListener('mousedown', e => this.mousedown(e));
    document.addEventListener('mouseup', e => this.mouseup(e));
    document.addEventListener('keydown', e => this.keydown(e));

    /* eslint-disable no-new */
    new AddPolygon(this.store);
    new RotationControl(this.store);
    new GlobalControls(this.store);
    /* eslint-enable no-new */
  }

  setCanvasSize() {
    this.$canvas.width = this.$main.clientWidth;
    this.$canvas.height = this.$main.clientHeight;
    this.$canvasTop.width = this.$main.clientWidth;
    this.$canvasTop.height = this.$main.clientHeight;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
  }

  clearCanvasTop() {
    this.ctxTop.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
  }

  drawPolygon(polygon, selected = false) {
    const scale = this.state.ui.scale;

    this.ctx.save();
    this.ctx.translate(this.$canvas.width / 2, this.$canvas.height / 2);

    this.ctx.beginPath();
    this.ctx.moveTo(polygon.coords[0][0] * scale, polygon.coords[0][1] * scale);

    for (let i = 1; i < polygon.coords.length; i += 1) {
      this.ctx.lineTo(polygon.coords[i][0] * scale, polygon.coords[i][1] * scale);
    }

    // Need to overlap to ensure the stroke go all the way round
    this.ctx.lineTo(polygon.coords[0][0] * scale, polygon.coords[0][1] * scale);
    this.ctx.lineTo(polygon.coords[1][0] * scale, polygon.coords[1][1] * scale);

    this.ctx.fillStyle = selected ? 'rgba(255, 255, 255, 1)' : 'rgba(245, 245, 245, 0.7)';
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#252831';
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawAllPolygons() {
    this.clearCanvas();

    this.state.polygons.forEach((polygon, index) => {
      if (index === this.state.ui.highlighted || this.state.ui.selected.indexOf(index) !== -1) {
        this.drawPolygon(polygon, true);
      } else {
        this.drawPolygon(polygon);
      }
    });
  }

  keydown(e) {
    if (this.mouse.canvasFocus) {
      const charCode = e.which || e.keyCode;

      if (this.state.ui.selected.length > 0 && charCode === 46) {
        e.preventDefault();
        this.store.dispatch(removeSelected(this.store.getState().ui.selected));
      }
    }
  }

  wheel(e) {
    this.store.dispatch(zoom(e.deltaY / 5));
  }

  mousemove(e) {
    this.mouse.prevX = this.mouse.x;
    this.mouse.prevY = this.mouse.y;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    if (this.mouse.down) {
      if (this.state.ui.highlighted !== -1 && this.state.ui.selected.length === 0) {
        this.dragPolygon(this.state.ui.highlighted);
      }

      if (this.state.ui.highlighted === -1) {
        this.createSelection();
      }

      if (this.mouse.selectionStart[0] === -1 &&
        this.state.ui.selected.length > 0 &&
        this.state.ui.selected.indexOf(this.state.ui.highlighted) !== -1) {
        this.dragSelected();
      }
    } else {
      this.checkHighlighted();
    }
  }

  mousedown(e) {
    this.mouse.down = true;
    this.mouse.dragged = false;
    this.mouse.canvasFocus = false;

    if (e.target === this.$canvasTop) {
      this.mouse.canvasFocus = true;
    }
  }

  mouseup(e) {
    const onCanvas = e.target === this.$canvasTop;

    this.mouse.down = false;

    if (!onCanvas) {
      this.mouse.canvasFocus = false;
    }

    if (this.mouse.selectionStart[0] === -1 && !this.mouse.dragged && onCanvas) {
      this.selectPolygon();
    }

    this.mouse.selectionStart = [-1, -1];
    this.clearCanvasTop();
  }

  transform(c, axis = 'x') {
    if (axis === 'y') {
      return (c - (this.$canvas.height / 2)) / this.state.ui.scale;
    }

    return (c - (this.$canvas.width / 2)) / this.state.ui.scale;
  }

  checkHighlighted() {
    let highlighted = -1;

    for (let i = this.state.polygons.length - 1; i >= 0; i -= 1) {
      const polygon = this.state.polygons[i];
      const transformed = [
        this.transform(this.mouse.x),
        this.transform(this.mouse.y, 'y'),
      ];

      if (polygon.contains(transformed[0], transformed[1])) {
        highlighted = i;
        break;
      }
    }

    if (highlighted !== this.state.ui.highlighted) {
      this.store.dispatch(highlightPolygon(highlighted));
    }
  }

  dragPolygon(index) {
    let dx = 0;
    let dy = 0;
    let snap = false;

    this.mouse.dragged = true;

    this.store.dispatch(translatePolygon(index, [
      (this.mouse.x - this.mouse.prevX) / this.state.ui.scale,
      (this.mouse.y - this.mouse.prevY) / this.state.ui.scale,
    ]));

    // Only snap for single highlighted or single selected polygon
    if (this.state.ui.selected.length < 2) {
      // Compare the moving polygon coordinates with every other polygons coordinates for snap
      this.state.polygons[index].coords.every(c => (
        this.state.polygons.every((p, i) => {
          if (i === index) {
            return true;
          }

          return p.coords.every((pc) => {
            dx = pc[0] - c[0];
            dy = pc[1] - c[1];

            if (Math.abs(dx) + Math.abs(dy) < 5 / this.state.ui.scale) {
              snap = true;
              return false;
            }

            return true;
          });
        })
      ));

      if (snap) {
        this.store.dispatch(translatePolygon(index, [dx, dy]));
      }

      if (index !== this.state.polygons.length - 1) {
        this.store.dispatch(pushPolygonsToTop([index]));
        this.store.dispatch(highlightPolygon(this.state.polygons.length - 1));
      }
    }

    this.drawAllPolygons();
  }

  dragSelected() {
    this.state.ui.selected.forEach((id) => {
      this.dragPolygon(id);
    });
  }

  selectPolygon() {
    const mouse = {
      x: this.transform(this.mouse.x),
      y: this.transform(this.mouse.y, 'y'),
    };
    let selected = -1;

    this.state.polygons.every((polygon, index) => {
      if (polygon.contains(mouse.x, mouse.y)) {
        selected = index;
        this.enableRotationControl();
        this.store.dispatch(highlightPolygon(-1));
        this.store.dispatch(pushPolygonsToTop([selected]));
        this.store.dispatch(selectPolygons([this.state.polygons.length - 1]));
        return false;
      }

      return true;
    });

    if (selected === -1) {
      this.disableRotationControl();
      this.store.dispatch(selectPolygons([]));
    }
  }

  createSelection() {
    if (this.mouse.selectionStart[0] === -1) {
      this.mouse.selectionStart = [this.mouse.prevX, this.mouse.prevY];
    }

    const width = this.mouse.x - this.mouse.selectionStart[0];
    const height = this.mouse.y - this.mouse.selectionStart[1];
    const transformed = {
      mouse: {
        x: this.transform(this.mouse.x),
        y: this.transform(this.mouse.y, 'y'),
      },
      selectionStart: [
        this.transform(this.mouse.selectionStart[0]),
        this.transform(this.mouse.selectionStart[1], 'y'),
      ],
    };
    const selected = [];

    this.disableRotationControl();
    this.clearCanvasTop();
    this.ctxTop.strokeStyle = 'white';
    this.ctxTop.strokeRect(this.mouse.selectionStart[0], this.mouse.selectionStart[1],
      width, height);
    this.ctxTop.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctxTop.fillRect(this.mouse.selectionStart[0], this.mouse.selectionStart[1],
      width, height);

    this.state.polygons.forEach((polygon, index) => {
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

    this.store.dispatch(pushPolygonsToTop(selected));
    this.store.dispatch(selectPolygons(selected.map((polygon, index) =>
      this.state.polygons.length - (selected.length - index),
    )));

    if (selected.length > 0) {
      this.enableRotationControl();
    }
  }

  disableRotationControl() {
    this.$angle.readOnly = true;
    this.$floatingAngleControl.style.display = 'none';
  }

  enableRotationControl() {
    this.$angle.readOnly = false;
    this.$floatingAngleControl.style.display = 'block';
    this.$angle.value = 0;
    this.$angleSlider.value = 0;
    this.$angleDisplay.innerHTML = '0°';
    this.store.dispatch(setAngle(0));
  }
}
