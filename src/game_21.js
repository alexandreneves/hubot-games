// Author
// Monkeys

module.exports = function(robot) {
	var messages = require('./games/21/messages');
	var stats = require('./stats/');
	var Session = require('./session');

	var session = new Session({
		game: require('./games/21')
	});

	var r = {
		help: /^!21(?:\shelp)?$/,
		start: /^!21 (?:start|s)(?:\s[0-9]*)?$/,
		hit: /^!21 (?:hit|h)$/,
		stand: /^!21 (?:stand|st)$/,
		double: /^!21 (?:double|d)$/,
		split: /^!21 (?:split|sp)$/,
		insurance: /^!21 (?:insurance|i)$/,
		stats: /^!21 (?:stats)$/
	};

	robot.hear(r.help, function(res) {
		res.reply(messages.help);
	});

	robot.hear(r.start, function(res) {
		var r = session.start(res);
		res[r[0]](r[1]);
	});

	robot.hear(r.hit, function(res) {
		var r = session.action('hit', res);
		res[r[0]](r[1]);
	});

	robot.hear(r.stand, function(res) {
		var r = session.action('stand', res);
		res[r[0]](r[1]);
	});

	robot.hear(r.stats, function(res) {
		res.send(stats.get(res));
	});
}