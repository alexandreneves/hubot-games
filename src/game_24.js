// Author
// tiagocunha

module.exports = function(robot) {
	var Game = require('./games/24');
	var game = new Game();

	var r = {
		start: /^!24 (start|s)$/,
		play: /^!24 (play|p) .*$/,
		stats: /^!24 stats?$/,
	};

	robot.hear(r.start, function(res) {
		res.send(game.start());
	});

	robot.hear(r.play, function(res) {
		res.send(game.play(res));
	});

	robot.hear(r.stats, function(res) {
		res.send(stats.get(res, [0, 2]));
	});
}
