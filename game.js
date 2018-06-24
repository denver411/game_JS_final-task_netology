'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  times(scale) {
    return new Vector(this.x * scale, this.y * scale);
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }
  get left() {
    return Number(this.pos.x);
  }
  get right() {
    return Number(this.pos.x + this.size.x);
  }
  get top() {
    return Number(this.pos.y);
  }
  get bottom() {
    return Number(this.pos.y + this.size.y);
  }
  get type() {
    return 'actor';
  }
  act() {}
  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Тип объекта должен быть Actor');
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

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = actors.find(actor => {
      if (actor.type === 'player') return actor;
    });
    this.height = grid.length;
    this.width = 0;

    for (let lines of grid) {
      if (Array.isArray(lines)) {
        this.width = Math.max(lines.length, this.width);
      }
    }
    this.status = null;
    this.finishDelay = 1;
  }
  isFinished() {
    if (this.status !== null && this.finishDelay < 0) {
      return true;
    }
    return false;
  }
  actorAt(actor) {
    if (!(actor instanceof Actor) || !actor) {
      throw new Error('Тип объекта должен быть Actor');
    }
    if (!this.grid || this.actors.length === 1) {
      return undefined;
    }
    if (this.actors.length) {
      for (let item of this.actors) {
        if (actor.isIntersect(item)) {
          return item
        }
      }
      return undefined
    }
  }
  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    if (pos.y + size.y > this.height) {
      return 'lava';
    };
    if (pos.x < 0 || pos.x + size.x > this.width || pos.y < 0) {
      return 'wall';
    };
    if (this.grid.length) {
      for (let y = Math.floor(pos.y); y < Math.ceil(pos.y + size.y); y++) {
        for (let x = Math.floor(pos.x); x < Math.ceil(pos.x + size.x); x++) {
          let position = this.grid[y][x];
          if (position === 'lava' || position === 'wall') {
            return position;
          };
        }
      }
    }
    return undefined;
  }
  removeActor(actor) {
    if (this.actors.indexOf(actor) >= 0) {
      this.actors.splice(this.actors.indexOf(actor), 1);
    }
  }
  noMoreActors(type) {
    for (let item of this.actors) {
      if (item.type === type) return false;
    }
    return true;
  }
  playerTouched(type, actor) {
    if (this.status === null) {
      if (type === 'lava' || type === 'fireball') this.status = 'lost';
      if (type === 'coin' && actor) {
        this.removeActor(actor);
        let coins = 0;
        for (let item of this.actors) {
          if (item.type === 'coin') coins++;
        }
        if (!coins) this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor(objects) {
    this.objects = objects;
  }

  actorFromSymbol(symb) {
    if (!symb || !this.objects[symb]) {
      return undefined;
    };
    return this.objects[symb];
  }

  obstacleFromSymbol(symb) {
    switch (symb) {
      case 'x':
        return 'wall';
      case '!':
        return 'lava';
      default:
        return undefined;
    }
  }
  createGrid(plan) {
    if (!plan) {
      return []
    };
    const grid = [];
    plan.forEach((line, posY) => {
      grid.push([]);
      const lineArray = line.split('');
      lineArray.forEach((element) => {
        grid[posY].push(this.obstacleFromSymbol(element));
      });
    });
    return grid;
  }

  createActors(plan) {
    if (!plan || !this.objects) {
      return []
    };
    const actors = [];
    plan.forEach((line, posY) => {
      const lineArray = line.split('');
      lineArray.forEach((lineElement, posX) => {
        let obj = this.actorFromSymbol(lineElement);
        if (typeof obj === 'function' && new obj instanceof Actor) {
          actors.push(new obj(new Vector(Number(posX), Number(posY))));
        }
      });
    })
    return actors
  }
  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan))
  }
}

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos);
    this.speed = speed;
    this.size = new Vector(1, 1);
  }
  get type() {
    return 'fireball';
  }
  getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
  }
  handleObstacle() {
    this.speed.x = -this.speed.x;
    this.speed.y = -this.speed.y;
    return this.speed;
  }
  act(time, level) {
    if (!level.obstacleAt(this.getNextPosition(time), this.size)) {
      this.pos = this.getNextPosition(time);
    } else {
      this.handleObstacle();
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos, size) {
    super(pos, size);
    this.speed = new Vector(2, 0);
  }
}

class VerticalFireball extends Fireball {
  constructor(pos, size) {
    super(pos, size);
    this.speed = new Vector(0, 2);
  }
}

class FireRain extends Fireball {
  constructor(pos, size) {
    super(pos, size);
    this.speed = new Vector(0, 3);
    this.startPos = pos;
  }
  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super();
    this.speed = new Vector(0, 0);
    this.size = new Vector(0.6, 0.6);
    this.startPos = pos.plus(new Vector(0.2, 0.1));
    this.pos = pos.plus(new Vector(0.2, 0.1));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;
  }
  get type() {
    return 'coin';
  }
  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist)
  }
  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector())
  }
  act(time = 1) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super();
    this.speed = new Vector(0, 0);
    this.size = new Vector(0.8, 1.5);
    this.pos = pos.plus(new Vector(0, -0.5));
  }
  get type() {
    return 'player';
  }
}


//попытка запуска игры
const schema = [
  [
    "        |           |  ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "     |                 ",
    "                       ",
    "         =      |      ",
    " @ |  o            o   ",
    "xxxxxxxxx!!!!!!!xxxxxxx",
    "                       "
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'o': Coin
}
const parser = new LevelParser(actorDict);
// loadLevels().then(levels => runGame(JSON.parse(levels), parser, DOMDisplay))
runGame(schema, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'))