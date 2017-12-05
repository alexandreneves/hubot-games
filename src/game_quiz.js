// Author
// Monkeys

module.exports = function (robot) {
	var messages = require('./games/quiz/messages');
	var stats = require('./stats/');
	var Session = require('./session');

	var session = new Session({
		game: require('./games/quiz'),
		players: 0,
		timeout: {
			time: 30 * 1000,
			callback: function (res) {
				res.reply(messages.timeout.replace('{0}', session.gameInstance(res).answerOutput()));
				stats.update({
					game: 'quiz',
					player: res.envelope.user.name,
					type: 2
				});
			}
		},
		interval: {
			time: 20 * 1000,
			callback: function(res) {
				res.reply(messages.timeLeftWarning);
			}
		}
	});

	var r = {
		help: /^!quiz$/,
		start: /^!quiz (?:start|s)$/,
		play: /^!quiz (?:play|p)$/,
		stats: /^!quiz stats$/,
	};

	robot.hear(r.help, function (res) {
		res.reply(messages.help);
	});

	robot.hear(r.start, function (res) {
		var r = session.start(res);
		res[r[0]](r[1]);
	});

	robot.hear(r.play, function (res) {
		var r = session.action('play', res);
		res[r[0]](r[1]);
	});

	robot.hear(r.stats, function (res) {
		res.send(stats.get(res, [0, 2]));
	});

}
