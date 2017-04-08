define(['./spider', './hero'], function (Spider, Hero) {
  PlayState = {};
  PlayState.preload = function () {
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');

    this.game.load.image('background', 'images/background.png');

    this.game.load.image('ground', 'images/ground.png');

    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    this.game.load.image('brick:1x1', 'images/grass_1x1.png');

    this.game.load.image('font:numbers', 'images/numbers.png');
    this.game.load.image('icon:coin', 'images/coin_icon.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('hero_stop', 'images/hero_stopped.png');
    this.game.load.image('key', 'images/key.png');
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);

    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
    this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
    this.game.load.spritesheet('door', 'images/door.png', 42, 66);
    this.game.load.spritesheet('decoration', 'images/decor.png', 42, 42);

    this.game.load.audio('sfx:jump', 'audio/jump3.wav');
    this.game.load.audio('sfx:coin', 'audio/coin3.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp3.wav');
    this.game.load.audio('sfx:dead', 'audio/dead.wav');
    this.game.load.audio('sfx:key', 'audio/key3.wav');
    this.game.load.audio('sfx:door', 'audio/door2.wav');
    this.game.load.audio('sfx:oneUp', 'audio/oneUp2.wav');
    this.game.load.audio('sfx:gameOver', 'audio/gameOver.wav');
    this.game.load.audio('music:bgm', 'audio/bgm3.mp3');
  };

  PlayState.toggleFull = function() {
    if (this.game.scale.isFullScreen) {
      this.game.scale.stopFullScreen();
    } else {
      this.game.scale.startFullScreen(false);
    }
  };

  PlayState.updateTime = function() {
    if (this.time > 0 ) {
      this.time--;
    } else if (!this.hero.dead) {
      this.game.music.bgm.stop();
      this.game.camera.fade(0x000000, 5000);
      this.sfx.dead.play();
      this.lives--;
      this.hero.die();
    }
  };

  PlayState.create = function () {
    this.game.world.resize(3000, 1200);
    this.game.add.tileSprite(0, 0, 3000, 1200, 'background');
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    this.game.input.onDown.add(this.toggleFull, this);
    this.game.time.events.loop(Phaser.Timer.SECOND, this.updateTime, this);

    this._loadLevel(this.game.cache.getJSON('level:'+this.level));
    this.sfx = {
      jump: this.game.add.audio('sfx:jump'),
      coin: this.game.add.audio('sfx:coin'),
      stomp: this.game.add.audio('sfx:stomp'),
      dead: this.game.add.audio('sfx:dead'),
      key: this.game.add.audio('sfx:key'),
      door: this.game.add.audio('sfx:door'),
      oneUp: this.game.add.audio('sfx:oneUp'),
      gameOver: this.game.add.audio('sfx:gameOver'),
    };

    if (this.game.music === undefined) {
      this.game.music = {
        bgm: this.game.add.audio('music:bgm')
      }
    }


    if (!this.game.music.bgm.isPlaying) {
      this.game.music.bgm.loop = true;
      this.game.music.bgm.play();
    }
    this._createHud();

    this.game.camera.flash(0x000000, 700);
  };

  PlayState.render = function() {
    // this.game.debug.soundInfo(this.game.music.bgm, 10, 70);
  };

  PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';
    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);

    let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26, NUMBERS_STR, 6);
    let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width, coinIcon.height / 2, this.coinFont);
    coinScoreImg.anchor.set(0, 0.5);

    let lifeIcon = this.game.make.image(400, 0, 'hero_stop');
    this.livesFont = this.game.add.retroFont('font:numbers', 20, 26, NUMBERS_STR, 6);
    let livesImg = this.game.make.image(lifeIcon.x + lifeIcon.width, lifeIcon.height / 2, this.livesFont);
    livesImg.anchor.set(0, 250);

    this.hud = this.game.add.group();
    this.hud.add(this.keyIcon);

    this.hud.add(coinIcon);
    this.hud.add(coinScoreImg);

    this.hud.add(lifeIcon);
    this.hud.add(livesImg);

    this.hud.position.set(10, 10);
    this.hud.fixedToCamera = true;
    this.hud.cameraOffset.setTo(10, 10);
  };

  PlayState._loadLevel = function (data) {
    this.platforms  = this.game.add.group();
    this.coins      = this.game.add.group();
    this.spiders    = this.game.add.group();
    this.decorations = this.game.add.group();
    this.bgDecoration = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;

    this._spawnDoor(data.door.x, data.door.y)
    this._spawnKey(data.key.x, data.key.y)
    data.platforms.forEach(this._spawnPlatform, this);
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});
    data.coins.forEach(this._spawnCoin, this);
    data.decorations.forEach(this._spawnDecoration, this);

    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
  };

  PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;
    this.key.y -= 3;
    this.game.add.tween(this.key)
      .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .loop()
      .start();
  };

  PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
  };

  PlayState._spawnDecoration = function(decoration) {
    let sprite = this.decorations.create(decoration.x, decoration.y, 'decoration');
    sprite.frame = decoration.frame;
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
  }

  PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false
    sprite.body.immovable = true;
  };

  PlayState._spawnCharacters = function (data) {
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.camera.follow(this.hero, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    this.game.add.existing(this.hero);

    data.spiders.forEach(function (spider) {
      const sprite = new Spider(this.game, spider.x, spider.y);
      this.spiders.add(sprite);
    }, this);
  };

  PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(platform.x, platform.y, platform.image);
    this.game.physics.enable(sprite);

    if (platform.image === 'ground') {
      sprite.body.width = 3000;
      sprite.texture.isTiling = true;
      sprite.texture.frame.width = 3000;
      sprite.texture.width = 3000;
    }

    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');

    sprite.body.allowGravity = false
    sprite.body.immovable = true;
  };

  PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
  };

  const LEVEL_COUNT = 2;
  PlayState.init = function (data) {
    this.level = (data.level || 0) % LEVEL_COUNT;
    this.game.renderer.renderSession.roundPixels = true;
    this.coinPickupCount = (data.coinPickupCount || 0);
    this.time = 300;
    this.lives = (data.lives || 3);
    this.hasKey = false;
    this.keys = this.game.input.keyboard.addKeys({
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      space: Phaser.KeyCode.SPACEBAR,
      up: Phaser.KeyCode.up,
      down: Phaser.KeyCode.down,
    });
    this.keys.space.onDown.add(function () {
      if (this.hero.jump()) {
        this.sfx.jump.play();
      }
    }, this);
  };

  PlayState.update = function () {
    const space  = this.coinPickupCount > 9 ? "               " : "                ";
    const space2 = this.coinPickupCount > 9 ? "                    " : "                    ";
    this.coinFont.text  = 'x' + this.coinPickupCount + space + "x" + this.lives + space2 + this.time;
    this.keyIcon.frame = this.hasKey ? 1 : 0;
    this.door.frame    = this.hasKey ? 1 : 0;
    this._handleCollisions();
    this._handleInput();
    if (this.hero.dead && (this.game.time.now - this.hero.deadAt > 5000)) {
      if (this.lives === 0) {
        this.game.state.restart(true, false, {
          level: 0,
          coinPickupCount: 0,
          lives: 3,
          gameOver: true,
        });
      } else {
        this.game.state.restart(true, false, {
          level: this.level,
          coinPickupCount: this.coinPickupCount,
          lives: this.lives
        });
      }
    }
  };

  PlayState._handleInput = function () {
    if (this.hero.dead) { return; }
    if (this.keys.left.isDown) { // move hero left
      this.hero.move(-1);
    } else if (this.keys.right.isDown) { // move hero right
      this.hero.move(1);
    } else { // stop
      this.hero.move(0);
    }
  };

  PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.platforms, null, this._onCollisionCallback, this);
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, this._onCollisionCallback, this);
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.overlap(this.hero, this.spiders, this._onHeroVsEnemy, this._onCollisionCallback, this);
    this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey, null, this)
    this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
      function (hero, door) {
        return this.hasKey && hero.body.touching.down;
      }, this);
  };

  PlayState._onHeroVsDoor = function (hero, door) {
    this.game.camera.fade(0x000000, 300);
    this.sfx.door.play();
    this.game.state.restart(true, false, {
      level: this.level + 1,
      coinPickupCount: this.coinPickupCount,
      lives: this.lives
    });
  };

  PlayState._onHeroVsKey = function(hero, key) {
    this.sfx.key.play();
    this.hasKey = true;
    key.kill();
  };

  PlayState._onHeroVsCoin = function(hero, coin) {
    if (this.coinPickupCount < 99) {
      this.sfx.coin.play();
      this.coinPickupCount++;
    } else {
      this.sfx.oneUp.play();
      this.coinPickupCount = 0;
      this.lives++;
    }
    coin.kill();
  };

  PlayState._onCollisionCallback = function(hero, target) {
    return !hero.dead;
  };

  PlayState._onHeroVsEnemy = function(hero, enemy) {
    if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
      this.sfx.stomp.play();
      enemy.die();
      hero.bounce();
    } else {
      this.game.music.bgm.stop();
      this.game.camera.fade(0x000000, 3000);
      this.sfx.dead.play();
      this.lives--;
      hero.die();
    }
  };

  return PlayState;
});
