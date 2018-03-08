// Author
// Monkeys

module.exports = function(robot) {
	var r = {
		calc: /^!calc .+/g,
		lmgtfy: /^!lmgtfy [\w\d\s]+/g,
		help: /^!help/g,
	};

	var help = '!calc: Calculator (e.g. !calc 1+1)\n!lmgtfy: url (e.g. !lmgtfy newb)\n\n!21: Blackjack\n!24: 24\n!cf: Connect Four\n!hang: Hangman\n!quiz: Quiz\n!tic: TicTacToe\n\nType - !{game} help - for help';

	robot.hear(r.calc, function(res)  {
		reg = /[-+]?\s*\d+\.?\d*\s*(?:[-+*%/]\s*?\d+\.?\d*\s*)+/;
		str = res.message.text.split('calc ')[1];
		if (reg.test(str)) res.reply(str +' = '+ eval(str));
	});

	robot.hear(r.lmgtfy, function(res) {
		res.send('http://lmgtfy.com/?q='+ encodeURIComponent(res.message.text.split('lmgtfy ')[1]));
	});

	robot.hear(r.help, function(res) {
		res.send('```'+ help +'```');
	});

	robot.enter(function(res) {
		res.reply('hello friend. !help for help :monkey_face:');
	});

	robot.error(function(res) {
		if (res) res.send('ein Verletzter! Alarm! Alarm!');
	});
}
