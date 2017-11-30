// Author
// aneves, centeno

module.exports = function(robot) {
	var messages = require('./games/hang/messages');
	var stats = require('./stats/');
	var Session = require('./session');

	var session = new Session({
		game: require('./games/hang'),
		timeout: {
			time: 5 * 60 * 1000,
			callback: function(res) {
				res.reply(messages.timeout.replace('{0}', session.gameInstance(res).wordOutput(true)));
				stats.update('hang', {
					player: res.envelope.user.name,
					type: 0
				});
			}
		},
		interval: {
			time: 4 * 60 * 1000,
			callback: function(res) {
				res.reply(messages.oneminleft);
			}
		}
	});

	var r = {
		help: /^!hang$/,
		start: /^!hang (?:start|s)$/,
		play: /^!hang (?:play|p) [a-z]{1}$/,
		guess: /^!hang (?:guess|g) [a-z]{2,}$/,
		stats: /^!hang stats$/,
	};

	robot.hear(r.help, function(res) {
		if (session.gameInstance(res)) {
			var r = session.state(res);
			res[r[0]](r[1]);
		} else {
			res.send('```'+ messages.help +'```');
		}
	});

    robot.hear(r.start, function(res) {
		var r = session.start(res);
		res[r[0]](r[1]);
    });

    robot.hear(r.play, function(res) {
		var r = session.action('play', res);
		res[r[0]](r[1]);
	});

	robot.hear(r.guess, function(res) {
		var r = session.action('play', res);
		res[r[0]](r[1]);
	});

	robot.hear(r.stats, function(res) {
		res.send(stats.get(res, [0, 2]));
	});
}
