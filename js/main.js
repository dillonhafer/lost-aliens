requirejs(["js/playstate", "js/titlestate"], function(PlayState) {
  let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
  game.state.add('title', TitleState);
  game.state.add('play', PlayState);
  game.state.start('title');
});
