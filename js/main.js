requirejs(["js/playstate"], function(PlayState) {
  let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
  game.state.add('play', PlayState);
  game.state.start('play', true, false, {level: 'main_menu'});
});
