define(['./spider', './hero'], function (Spider, Hero) {
  PlayState = {};
  PlayState.preload = function () {
    this.game.load.bitmapFont('carrier_command', 'fonts/bitmapFonts/carrier_command.png', 'fonts/bitmapFonts/carrier_command.xml');
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');

    this.game.load.atlasXML('tiles', 'sprites/tiles_spritesheet.png', 'sprites/tiles_spritesheet.xml');
    this.game.load.atlasXML('items', 'sprites/items_spritesheet.png', 'sprites/items_spritesheet.xml');

    this.game.load.atlas('bot', 'sprites/p1_walk.png', 'sprites/p1_walk.json');
    this.game.load.atlas('bot2', 'sprites/p2_walk.png', 'sprites/p2_walk.json');

    this.game.load.image('background', 'images/background.png');
    this.game.load.image('clouds', 'images/background_clouds.png');
    this.game.load.image('background_green', 'images/background_green.png');

    this.game.load.image('font:numbers', 'images/numbers.png');
    this.game.load.image('icon:coin', 'images/coin_icon.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('hero_stop', 'images/hero_stopped.png');
    this.game.load.image('key', 'images/key.png');
    this.game.load.image('extraLife', 'images/extra_life.png');
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);

    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    this.game.load.spritesheet('hero', 'images/hero.png', 32, 42);
    this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
    this.game.load.spritesheet('door', 'images/door.png', 42, 66);

    this.game.load.audio('sfx:jump', 'audio/jump3.wav');
    this.game.load.audio('sfx:coin', 'audio/coin3.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp3.wav');
    this.game.load.audio('sfx:dead', 'audio/dead.wav');
    this.game.load.audio('sfx:key', 'audio/key3.wav');
    this.game.load.audio('sfx:door', 'audio/door2.wav');
    this.game.load.audio('sfx:oneUp', 'audio/oneUp2.wav');
    this.game.load.audio('sfx:gameOver', 'audio/gameOver2.wav');
    this.game.load.audio('music:bgm', 'audio/bgm5.mp3');
    this.game.load.audio('music:title', 'audio/title2.mp3');
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
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    if (this.game.music === undefined) {
      this.game.music = {
        bgm: this.game.add.audio('music:bgm'),
        title: this.game.add.audio('music:title'),
      }
    }

    if (isNaN(this.level)) {
      this._loadMainMenu();
    } else {
      this.game.input.onDown.add(this.toggleFull, this);
      this.game.world.resize(3000, 1200);
      this.game.time.events.loop(Phaser.Timer.SECOND, this.updateTime, this);

      let level = this.game.cache.getJSON('level:'+this.level);
      this._loadLevel(level);
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

      if (!this.game.music.bgm.isPlaying) {
        this.game.music.bgm.loop = true;
        this.game.music.bgm.volume = 0.2;
        this.game.music.bgm.play();
      }
      this._createHud();

      this.game.camera.flash(0x000000, 700);
    }
  };

  PlayState.render = function() {
    // this.game.debug.input(this.game.input, 10, 70);
    // this.game.debug.text("Duration: " + this.game.keys.activePointer.duration, 10, 70);
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
    this.background = this.game.add.tileSprite(0, 0, 3000, 1200, data.background);
    this.clouds = this.game.add.tileSprite(0, 0, 3000, 1200, 'clouds');
    this._spawnGround(data.ground);

    if (data.background !== 'background') {
      this.clouds.visible = false
    }
    this.platforms  = this.game.add.group();
    this.decorations = this.game.add.group();
    this.extraLives = this.game.add.group();

    this.coins      = this.game.add.group();
    this.bgDecoration = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.spiders    = this.game.add.group();

    this._spawnDoor(data.door.x, data.door.y)
    this._spawnKey(data.key.x, data.key.y)
    data.platforms.forEach(this._spawnPlatform, this);
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});
    data.coins.forEach(this._spawnCoin, this);
    data.decorations.forEach(this._spawnDecoration, this);
    data.extraLives.forEach(this._spawnExtraLife, this);

    this.game.world.bringToTop(this.extraLives);
    this.game.world.bringToTop(this.hero);

    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
  };

  PlayState._spawnExtraLife = function (extraLife) {
    let sprite = this.extraLives.create(extraLife.x, extraLife.y, 'extraLife');
    sprite.anchor.set(0.5, 0.5);
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false
    sprite.body.immovable = true;
    sprite.update = function() {
      this.angle += 2.5;
    }
  };

  PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;
    this.key.y -= 3;
    this.game.add.tween(this.key)
      .to({y: this.key.y + 8}, 800, Phaser.Easing.Sinusoidal.InOut)
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
    let sprite = this.decorations.create(decoration.x, decoration.y, decoration.set, decoration.image);
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
    let sprite = this.platforms.create(platform.x, platform.y, 'tiles', platform.image);
    sprite.scale.setTo(0.6, 0.6);
    this.game.physics.enable(sprite);

    if (platform.image.includes("Left.png")) {
      this._spawnEnemyWall(platform.x, platform.y, 'left');
    }
    if (platform.image.includes("Right.png")) {
      this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
    }

    sprite.body.allowGravity = false
    sprite.body.immovable = true;
  };

  PlayState._spawnGround = function(ground) {
    this.ground = this.game.add.tileSprite(ground.x, ground.y, 3000, 70, 'tiles', ground.image);
    this.game.physics.enable(this.ground);
    this.ground.body.allowGravity = false
    this.ground.body.immovable = true;
    this.game.world.bringToTop(this.ground);
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
    this.lastCameraX = 0;
    this.lastCameraY = 0;
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
      shift: 16,
    });

    this.keys.space.onDown.add(function (pointer) {
      if (this.hero.jump(600)) {
        this.sfx.jump.play();
      }
    }, this);
  };

  PlayState._handleParallax = function() {
    if (this.background !== undefined) {
      if (this.game.camera.x < this.lastCameraX) {
        this.background.tilePosition.x -= 0.3;
      }
      if (this.game.camera.x > this.lastCameraX) {
        this.background.tilePosition.x += 0.3;
      }
      if (this.game.camera.y < this.lastCameraY) {
        this.background.tilePosition.y -= 0.3;
      }
      if (this.game.camera.y > this.lastCameraY) {
        this.background.tilePosition.y += 0.3;
      }
    }
    this.lastCameraX = this.game.camera.x;
    this.lastCameraY = this.game.camera.y;
  }

  PlayState.update = function () {
    this._handleParallax();

    if (this.clouds.tilePosition !== null) {
      this.clouds.tilePosition.x = this.clouds.tilePosition.x - 0.5;
    }

    if (isNaN(this.level)) {
      if (this.bot.x > 1000) {
        this.bot.x = -70;
      } else {
        this.bot.x = this.bot.x + 3.5;
      }

      if ((this.bot2.scale.x == 1 && this.bot2.x >= 300) || (this.bot2.scale.x == -1 && this.bot2.x >= 100) ) {
        if (this.bot2.scale.x == 1) {
          this.bot2.x += 70
        }
        this.bot2.scale.x = -1;
        this.bot2.x = this.bot2.x - 4.5;
      } else if ((this.bot2.x <= 100 && this.bot2.scale.x == -1) || (this.bot2.scale.x == 1 && this.bot2.x < 300)) {
        if (this.bot2.scale.x == -1) {
          this.bot2.x -= 70
        }
        this.bot2.scale.x = 1;
        this.bot2.x = this.bot2.x + 4.5;
      }

      if (this.bot2.x >= 900) {
      } else if (this.bot2.x < 20){
      }
    } else {
      const space  = this.coinPickupCount > 9 ? "               " : "                ";
      const space2 = this.coinPickupCount > 9 ? "                    " : "                    ";
      this.coinFont.text  = 'x' + this.coinPickupCount + space + "x" + this.lives + space2 + this.time;
      this.keyIcon.frame = this.hasKey ? 1 : 0;
      this.door.frame    = this.hasKey ? 1 : 0;


      this._handleCollisions();
      this._handleInput();
      if (this.hero.dead && (this.game.time.now - this.hero.deadAt > 5000)) {
        if (this.lives === 0) {
          this.game.state.restart(true, false, {level: 'main_menu'});
        } else {
          this.game.state.restart(true, false, {
            level: this.level,
            coinPickupCount: this.coinPickupCount,
            lives: this.lives
          });
        }
      }
    }
  };

  PlayState._handleInput = function () {
    if (this.hero.dead) { return; }
    if (this.keys.left.isDown) { // move hero left
      let speed = -1;
      if (this.keys.shift.isDown) {
        speed = -1.5;
      }
      this.hero.move(speed);
    } else if (this.keys.right.isDown) { // move hero right
      let speed = 1;
      if (this.keys.shift.isDown) {
        speed = 1.5;
      }
      this.hero.move(speed);
    } else { // stop
      this.hero.move(0);
    }
  };

  PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.ground, null, this._onCollisionCallback, this);
    this.game.physics.arcade.collide(this.hero, this.platforms, null, this._onCollisionCallback, this);
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, this._onCollisionCallback, this);
    this.game.physics.arcade.overlap(this.hero, this.extraLives, this._onHeroVsExtraLife, this._onCollisionCallback, this);
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

  PlayState._onHeroVsExtraLife = function(hero, extraLife) {
    let txt = this.game.add.bitmapText(extraLife.x+20, extraLife.y+20, 'carrier_command', '1up', 16);
    this.game.physics.arcade.enable([txt]);
    txt.tint = '0xdf0000';
    txt.body.velocity.setTo(200, 2);
    txt.body.collideWorldBounds = false;
    txt.body.bounce.set(1);

    this.sfx.oneUp.play();
    this.lives++;
    extraLife.kill();
  };

  PlayState._onCollisionCallback = function(hero, target) {
    return !hero.dead;
  };

  PlayState._onHeroVsEnemy = function(hero, enemy) {
    if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
      this.sfx.stomp.play();
      enemy.die();
      let speed = 200;
      if (this.keys.shift.isDown) {
        speed = 700;
      }
      hero.bounce(speed);
    } else {
      this.game.music.bgm.stop();
      this.game.camera.fade(0x000000, 3000);
      this.sfx.dead.play();
      this.lives--;
      hero.die();
    }
  };

  PlayState._loadMainMenu = function() {
    this.game.world.resize(960, 600);
    this.game.camera.flash(0x000000, 1000);
    this.game.add.tileSprite(0, 0, 3000, 1200, 'background');
    this.clouds = this.game.add.tileSprite(0, 0, 3000, 1200, 'clouds');

    this.game.music.title.loop = true;
    this.game.music.title.volume = 0.2;
    this.game.music.title.play();

    // Decorations
    this.game.add.sprite(20, 400, 'items', 'bush.png');
    this.game.add.sprite(488, 400, 'items', 'rock.png');
    this.game.add.sprite(288, 330, 'tiles', 'hill_largeAlt.png');
    this.game.add.sprite(328, 345, 'tiles', 'hill_largeAlt.png');

    let shadow = this.game.add.bitmapText(this.game.world.centerX-350, 201, 'carrier_command', 'Little Lost Aliens', 32);
    shadow.tint = "0x14909a";
    this.game.add.bitmapText(this.game.world.centerX-350, 200, 'carrier_command', 'Little Lost Aliens', 32);

    button = this.game.add.button(this.game.world.centerX - 21, 400, 'tiles', function() {
      this.game.music.title.stop();
      this.game.state.restart(true, false, {
        level: 0,
        coinPickupCount: 0,
        lives: 3,
        gameOver: true,
      });
    }, this, 'signRight.png', 'signRight.png');

    this.game.add.bitmapText(this.game.world.centerX-12, 422, 'carrier_command', 'start', 9);

    let ground = {
      x: 0,
      y: 469,
      image: 'grassMidDemo.png',
      imageFill: 'grassCenterDemo.png',
    }

    this.game.add.tileSprite(ground.x, ground.y+60, 6000, 100, 'tiles', ground.imageFill);

    // Create ground
    this.ground = this.game.add.tileSprite(ground.x, ground.y, 960, 70, 'tiles', ground.image);

    this.bot2 = this.game.add.sprite(50, 375, 'bot2');
    this.bot2.animations.add('run');
    this.bot2.animations.play('run', 42, true);

    this.bot = this.game.add.sprite(50, 375, 'bot');
    this.bot.animations.add('run');
    this.bot.animations.play('run', 42, true);
  }

  return PlayState;
});
