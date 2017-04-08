define(function () {
  function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.animations.add('stop', [0]);
    this.animations.add('run', [1, 2], 8, true); // 8fps looped
    this.animations.add('jump', [3]);
    this.animations.add('fall', [4]);
    this.animations.add('dead', [5]);
  }

  Hero.prototype = Object.create(Phaser.Sprite.prototype);
  Hero.prototype.constructor = Hero;

  Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // jumping
    if (this.body.velocity.y < 0) {
      name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
      name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
      name = 'run';
    }

    if (this.dead) {
      name = 'dead'
    }

    return name;
  };

  Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
      this.animations.play(animationName);
    }
  };

  Hero.prototype.move = function (direction) {
    this.body.velocity.x = direction * 200;

    if (this.body.velocity.x < 0) {
      this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
      this.scale.x = 1;
    }
  };

  Hero.prototype.win = function () {
    this.dead = true;
    this.deadAt = this.game.time.now;
    this.body.velocity.x = 0;
  };

  Hero.prototype.die = function () {
    this.dead = true;
    this.body.collideWorldBounds = false;
    this.deadAt = this.game.time.now;
    this.jump();
    this.body.velocity.x = 0;
  };

  Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
  };

  Hero.prototype.jump = function (speed) {
    const canJump = this.body.touching.down;

    if (canJump) {
      this.body.velocity.y = -speed;
    }

    return canJump;
  };

  return Hero;
})
