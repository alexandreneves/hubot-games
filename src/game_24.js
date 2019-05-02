// Author:
// tiagocunha

module.exports = function(robot) {
	var Session = require('./session');
	var stats = require('./stats/');

	var session = new Session({
		game: require('./games/24'),
		players: 0
	});

	var r = {
		start: /^!24 (?:start|s)$/,
		play: /^!24 (?:play|p) (.*)$/,
		state: /^!24 state$/,
		stats: /^!24 stats$/,
	};

	robot.hear(r.start, function(res) {
		var r = session.start(res);
		res[r[0]](r[1]);
	});

	robot.hear(r.play, function(res) {
		var r = session.action('play', res);
		res[r[0]](r[1]);
	});

	robot.hear(r.state, function(res) {
		var r = session.action('status', res);
		res[r[0]](r[1]);
	});

	robot.hear(r.stats, function(res) {
		res.send(stats.get(res, [0, 2]));
	});
}
