module.exports = function() {
	var stats = require('../../stats/');
	var messages = require('./messages');
	var Sequence = require('./sequence');
	sequence = new Sequence();

	gameStarted = 0;
	seq = [0, 0, 0, 0];
	number_top = 0;
	number_left = 0;
	number_right = 0;
	number_down = 0;

	var isFoundIn = function(term, array) {
		return array.indexOf(term);
	};

	var numberToText = function(number) {
		if (number == 0) return ':zero:';
		if (number == 1) return ':one:';
		if (number == 2) return ':two:';
		if (number == 3) return ':three:';
		if (number == 4) return ':four:';
		if (number == 5) return ':five:';
		if (number == 6) return ':six:';
		if (number == 7) return ':seven:';
		if (number == 8) return ':eight:';
		if (number == 9) return ':nine:';
	};

	// PUBLIC METHODS

	var start = function() {
		if (gameStarted == 1) return messages.startedAlready

		gameStarted = 1;
		seq = sequence.get_new_sequence();
		number_top = seq[0];
		number_left = seq[1];
		number_right = seq[2];
		number_down = seq[3];

		var str = '';
		str += ':white_small_square: ' + numberToText(number_top) + ' :white_small_square:\n';
		str += numberToText(number_left) + ' :white_small_square: ' + numberToText(number_right) + '\n';
		str += ':white_small_square: ' + numberToText(number_down) + ' :white_small_square:\n';

		return str;
	};

	var play = function(res) {
		if (gameStarted != 1) return;

		var found = res.match[1].match(/(\d)+/g);

		if (found.length != 4) return messages.invalidMove + " because you must provide exactly 4 numbers";

		var test_seq = seq.slice(0); // make a copy of the sequence array

		for(var i = 0; i < found.length; i++) {
			if (isFoundIn(parseInt(found[i]), test_seq) == -1) {
				return messages.invalidMove + 'at index ' + i+1;
			}
			test_seq.splice(test_seq.indexOf(parseInt(found[i])), 1)
		}

		var str;

		if (eval(res.match[1]) == 24) {
			str = res.match[1] + ' == 24!\n'
			str += ':fireworks: ' + res.message.user.name + ' is victorious. Saving statistics to brain.'
			stats.update('24', {
				player: res.message.user.name,
				type: 0
			});
		} else {
			str = res.match[1] + ' == ' + eval(res.match[1]) + ' != 24\n'
			str += ':dizzy_face: :dizzy_face: :dizzy_face:  ' + res.message.user.name + ' loses. Saving statistics to brain.'
			stats.update('24', {
				player: res.message.user.name,
				type: 2
			});
		}

		gameStarted = 0;

		return str;
	};

	return { start, play };
}
