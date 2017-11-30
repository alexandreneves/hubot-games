// Author
// aneves, centeno

module.exports = function(robot) {
	var messages = require('./games/tic/messages');
	var stats = require('./stats/');
	var Session = require('./session');

	var session = new Session({
		game: require('./games/tic'),
		players: 2
	});

	var r = {
		help: /^!tic$/,
		start: /^!tic (?:start|s)$/,
		join: /^!tic (?:join|j)$/,
		play: /^!tic (?:play|p) [1-9]{1}$/,
		stats: /^!tic stats$/,
	};

	robot.hear(r.help, function(res) {
		res.send('```'+ messages.help +'```');
	});

	robot.hear(r.start, function(res) {
		var r = session.start(res);
		res[r[0]](r[1]);
	});

	robot.hear(r.join, function(res) {
		var r = session.join(res);
		res[r[0]](r[1]);
	});

	robot.hear(r.play, function(res) {
		var r = session.action('play', res);
		res[r[0]](r[1]);
	});

	robot.hear(r.stats, function(res) {
		res.send(stats.get(res));
	});
}
