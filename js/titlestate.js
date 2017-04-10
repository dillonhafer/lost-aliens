define(function () {
  TitleState = {};
  TitleState.preload = function () {
    this.game.load.atlas('bot', 'sprites/p1_walk.png', 'sprites/p1_walk.json');
    this.game.load.atlas('bot2', 'sprites/p2_walk.png', 'sprites/p2_walk.json');
    this.game.load.atlasXML('items', 'sprites/items_spritesheet.png', 'sprites/items_spritesheet.xml');
    this.game.load.atlasXML('tiles', 'sprites/tiles_spritesheet.png', 'sprites/tiles_spritesheet.xml');
    this.game.load.audio('music:title', 'audio/title2.mp3');
    this.game.load.bitmapFont('carrier_command', 'fonts/bitmapFonts/carrier_command.png', 'fonts/bitmapFonts/carrier_command.xml');
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('clouds', 'images/background_clouds.png');
  };

  TitleState.create = function () {
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    if (this.game.music === undefined) {
      this.game.music = {
        title: this.game.add.audio('music:title'),
      }
    }

    this._loadMainMenu();
  };

  TitleState.init = function(data) {
    this.game.renderer.renderSession.roundPixels = true;
  };

  TitleState.update = function () {
    this.clouds.tilePosition.x = this.clouds.tilePosition.x - 0.5;

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
  };

  TitleState._loadMainMenu = function() {
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
      this.game.state.start('play', true, false, {
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

  return TitleState;
});
