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

//код для проверки
const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);


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

//код для проверки

let items = new Map();
let player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);

//класс Level

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = actors.find(actor => {
      if (actor.type === "player") return actor;
    });
    this.height = grid.length;
    this.width = 0;
    if (grid[0]) {
      for (let lines of grid) {
        if (lines.length > this.width) this.width = lines.length;
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
      throw new Error("Тип объекта должен быть Actor");
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
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    if (pos.y + size.y > this.height) return 'lava';
    if (this.grid[0][0]) {
      for (let i = Math.floor(pos.y); i < Math.ceil(pos.y + size.y); i++) {
        for (let j = Math.floor(pos.x); j <= Math.ceil(pos.x + size.x); j++) {
          if (this.grid[i][j] === 'lava') return 'lava';
        }
      }
      for (let i = Math.floor(pos.y); i < Math.ceil(pos.y + size.y); i++) {
        for (let j = Math.floor(pos.x); j <= Math.ceil(pos.x + size.x); j++) {
          if (this.grid[i][j] === 'wall') return 'wall';
        }
      }
    }
    if (pos.x < 0 || pos.x + size.x >= this.width) return 'wall';
    if (pos.y < 0) return 'wall';

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

//код для проверки

let grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
player = new Actor();
const fireball = new Actor();

let level = new Level(grid, [goldCoin, bronzeCoin, player, fireball]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}



//Парсер уровня
class LevelParser {
  constructor(objects) {
    this.objects = objects;
  }

  actorFromSymbol(symb) {
    if (!symb || !this.objects[symb]) return undefined;
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
    if (!plan) return [];
    const grid = plan.slice();
    for (let items in grid) {
      grid[items] = grid[items].split('');
      for (let item in grid[items]) {
        grid[items][item] = this.obstacleFromSymbol(grid[items][item]);
        // if (!grid[items][item]) grid[items][item] = 'undefined';
      }
    }
    return grid;
  }

  createActors(plan) {
    if (!plan || !this.objects) return [];
    const actors = [];
    for (let y = 0; y < plan.length; y++) {
      if (plan[y]) {
        const planParse = plan[y].split('');
        for (let x = 0; x < planParse.length; x++) {
          if (Actor.isPrototypeOf(this.objects[planParse[x]]) || this.objects[planParse[x]] === Actor) {
            actors.push(new this.objects[planParse[x]](new Vector(x, y)));
          }
        }
      }
    }
    return actors
  }
  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan))
  }
}


//Проверка кода
const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));

//попытка запуска игры
// grid = [
//   new Array(3), ['wall', 'wall', 'lava']
// ];
// level = new Level(grid);
// runLevel(level, DOMDisplay);