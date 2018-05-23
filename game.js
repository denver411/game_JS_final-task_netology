'use strict';

//класс Vector

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  times(scale) {
    return new Vector(this.x * scale, this.y * scale);
  }
}


//класс Actor

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }
  get left() {
    return this.pos.x;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get top() {
    return this.pos.y;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
  get type() {
    return 'actor';
  }
  act() {}
  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error("Тип объекта должен быть Actor");
    }
    if (this.pos === actor.pos && this.size === actor.size) {
      return false
    }
    if (this.left >= actor.right || this.right <= actor.left || this.top >= actor.bottom || this.bottom <= actor.top) {
      return false;
    }
    return true;
  }
}