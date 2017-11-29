// Author
// Monkeys

module.exports = function(robot) {
	var r = {
		calc: /^!calc .+/g,
		help: /^!help/g,
	};

	var help = 'Hello @{0}\n \
		\n \
		!calc: Calculator (e.g. !calc 1+1)\n \
		\n \
		!21: Blackjack\n \
		!24: 24\n \
		!con4: Connect 4\n \
		!hang: Hangman\n \
		!quiz: Quiz\n \
		!tic: TicTacToe\n \
		\n \
		Type - !{game} help - for help\n \
		\n \
		ktksbye :monkey_face:  \
	';

	robot.hear(r.calc, function(res)  {
		reg = /[-+]?\s*\d+\.?\d*\s*(?:[-+*%/]\s*?\d+\.?\d*\s*)+/;
		str = res.message.text.split('calc ')[1];
		if (reg.test(str)) res.reply(str +' = '+ eval(str));
	});

	robot.hear(r.help, function(res) {
		res.send(help.replace('{0}', res.envelope.user.name));
	});

	robot.enter(function(res) {
		res.reply('hello friend. !help for help :monkey_face:');
	});

	robot.error(function(res) {
		if (res) res.send('ein Verletzter! Alarm! Alarm!');
	});
}
