'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(obj) {
    if (!(obj instanceof Vector)) {
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    } else {
      return new Vector(this.x + obj.x, this.y + obj.y);
    }
  }
  times(scale) {
    return new Vector(this.x * scale, this.y * scale);
  }
}