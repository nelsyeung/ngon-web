export default class {
  constructor() {
    this.$main = document.getElementById('main');
    this.$canvas = {
      cache: document.getElementById('canvas-cache'),
      bg: document.getElementById('canvas-bg'),
      fg: document.getElementById('canvas-fg'),
      selection: document.getElementById('canvas-selection'),
    };
    this.ctx = {
      cache: this.$canvas.cache.getContext('2d'),
      bg: this.$canvas.bg.getContext('2d'),
      fg: this.$canvas.fg.getContext('2d'),
      selection: this.$canvas.selection.getContext('2d'),
    };
    this.scale = 50;
    this.cacheOffset = [0, 0];
    this.cacheAngle = 0;

    this.setCanvasSize();
  }

  setCanvasSize() {
    Object.keys(this.$canvas).forEach((key) => {
      this.$canvas[key].width = this.$main.clientWidth;
      this.$canvas[key].height = this.$main.clientHeight;
    });
  }

  clearCanvas(canvas) {
    this.ctx[canvas].clearRect(0, 0, this.$canvas[canvas].width, this.$canvas[canvas].height);
  }

  drawPolygon(polygon, selected = false) {
    const canvas = selected ? 'fg' : 'bg';

    this.ctx[canvas].save();
    this.ctx[canvas].translate(Math.round(this.$canvas[canvas].width / 2),
      Math.round(this.$canvas[canvas].height / 2));

    this.ctx[canvas].beginPath();
    this.ctx[canvas].moveTo(Math.round(polygon.coords[0][0] * this.scale),
      Math.round(polygon.coords[0][1] * this.scale));

    for (let i = 1; i < polygon.coords.length; i += 1) {
      this.ctx[canvas].lineTo(Math.round(polygon.coords[i][0] * this.scale),
        Math.round(polygon.coords[i][1] * this.scale));
    }

    // Need to overlap to ensure the stroke go all the way round
    this.ctx[canvas].lineTo(Math.round(polygon.coords[0][0] * this.scale),
      Math.round(polygon.coords[0][1] * this.scale));
    this.ctx[canvas].lineTo(Math.round(polygon.coords[1][0] * this.scale),
      Math.round(polygon.coords[1][1] * this.scale));

    this.ctx[canvas].fillStyle = selected ? 'rgba(255, 255, 255, 1)' : 'rgba(245, 245, 245, 0.7)';
    this.ctx[canvas].fill();
    this.ctx[canvas].lineWidth = 1;
    this.ctx[canvas].strokeStyle = '#252831';
    this.ctx[canvas].stroke();
    this.ctx[canvas].restore();
  }

  cache() {
    this.cacheOffset = [0, 0];
    this.cacheAngle = 0;
    this.clearCanvas('cache');
    this.ctx.cache.drawImage(this.$canvas.fg, 0, 0);
  }

  moveSelected(v) {
    this.clearCanvas('fg');

    this.cacheOffset[0] += Math.round(v[0] * this.scale);
    this.cacheOffset[1] += Math.round(v[1] * this.scale);

    this.ctx.fg.save();
    this.ctx.fg.translate(this.cacheOffset[0], this.cacheOffset[1]);
    this.ctx.fg.drawImage(this.$canvas.cache, 0, 0);
    this.ctx.fg.restore();
  }

  drawSelection(start, width, height) {
    this.clearCanvas('selection');
    this.ctx.selection.strokeStyle = 'white';
    this.ctx.selection.strokeRect(start[0], start[1], width, height);
    this.ctx.selection.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.selection.fillRect(start[0], start[1], width, height);
  }
}
