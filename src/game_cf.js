// Author
// aneves, tiagocunha

module.exports = function(robot) {
	var messages = require('./games/cf/messages');
	var stats = require('./stats/');
	var Session = require('./session');

	var session = new Session({
		game: require('./games/cf'),
		players: 2
	});

	var r = {
		help: /^!cf$/,
		start: /^!cf (?:start|s)$/,
		join: /^!cf (?:join|j)$/,
		play: /^!cf (?:play|p) ([1-7]{1})$/,
		stats: /^!cf stats$/,
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
		res.send(stats.get(res, [0, 1, 2]));
	});
}
