define(function () {
  const Hero = require('js/hero')

  PlayState = {};
  PlayState.preload = function () {
    this.game.load.json('level:1', 'data/level01.json');

    this.game.load.image('background', 'images/background.png');

    this.game.load.image('ground', 'images/ground.png');

    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');

    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);

    this.game.load.image('hero', 'images/hero_stopped.png');

    this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);

    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
  };

  PlayState.create = function () {
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON('level:1'));
    this.sfx = {
      jump: this.game.add.audio('sfx:jump'),
      coin: this.game.add.audio('sfx:coin')
    };
  };

  PlayState._loadLevel = function (data) {
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group();

    data.platforms.forEach(this._spawnPlatform, this);
    this._spawnCharacters({hero: data.hero, coins: data.coins});
    data.coins.forEach(this._spawnCoin, this);

    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
  };

  PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
  };

  PlayState._spawnCharacters = function (data) {
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
  };

  PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(platform.x, platform.y, platform.image);
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false
    sprite.body.immovable = true;
  };


  PlayState.init = function () {
    this.game.renderer.renderSession.roundPixels = true;
    this.keys = this.game.input.keyboard.addKeys({
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      up: Phaser.KeyCode.UP
    });
    this.keys.up.onDown.add(function () {
      if (this.hero.jump()) {
        this.sfx.jump.play();
      }
    }, this);
  };

  PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();
  };

  PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
      this.hero.move(-1);
    } else if (this.keys.right.isDown) { // move hero right
      this.hero.move(1);
    } else { // stop
      this.hero.move(0);
    }
  };

  PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.platforms);
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, null, this);
  };

  PlayState._onHeroVsCoin = function(hero, coin) {
    this.sfx.coin.play();
    coin.kill();
  };

  return PlayState;
});
