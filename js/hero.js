define(function () {
  function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);
    this.game.physics.enable(this);
    // this.body.collideWorldBounds = true;
  }

  Hero.prototype = Object.create(Phaser.Sprite.prototype);
  Hero.prototype.constructor = Hero;

  Hero.prototype.move = function (direction) {
    this.body.velocity.x = direction * 200;
    if (this.body.sprite.position.x > 980) {
      this.body.sprite.position["x"] = -2;
      return;
    }

    if (this.body.sprite.position.x < -2) {
      this.body.sprite.position["x"] = 979;
      return;
    }
  };

  Hero.prototype.jump = function () {
    const JUMP_SPEED = 600;
    const canJump = this.body.touching.down;

    if (canJump) {
      this.body.velocity.y = -JUMP_SPEED;
    }

    return canJump;
  };

  return Hero;
})
