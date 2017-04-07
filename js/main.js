requirejs(["js/hero", "js/playstate"], function(util) {
  const PlayState = require('js/playstate');
  const game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');

  game.state.add('play', PlayState);
  game.state.start('play');
});
