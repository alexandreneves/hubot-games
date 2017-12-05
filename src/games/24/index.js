module.exports = function() {
	var stats = require('../../stats/');
	var messages = require('./messages');

	var state = {
		sequence: require('./sequence')(),
		payload: null,
		res: null,
	}

	var end = function() {
		state.payload.callback(state.res);
	}

	var inArray = function(term, array) {
		return array.indexOf(term);
	};

	var getNumberEmoji = function(number) {
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

	var getPlayerName = function() {
		return state.res.envelope.user.name
	}

	var updateStats = function(type) {
		stats.update({
			game: '24',
			player: getPlayerName(),
			type: type
		});
	}

	var draw = function() {
		var empty = ':white_small_square:';
		var nTop = state.sequence[0];
		var nLeft = state.sequence[1];
		var nRight = state.sequence[2];
		var nDown = state.sequence[3];

		var str = '';
		str += empty + getNumberEmoji(nTop) + empty +'\n';
		str += getNumberEmoji(nLeft) + empty + getNumberEmoji(nRight) + '\n';
		str += empty + getNumberEmoji(nDown) + empty +'\n';

		return str;
	}

	// PUBLIC METHODS

	var start = function(res, payload) {
		state.res = res;
		state.payload = payload;
		return ['send', draw()];
	};

	var play = function(res) {
		state.res = res;

		var eq = res.match[1];
		var numbers = eq.match(/(\d)+/g);

		if (numbers.length !== 4) return ['reply', messages.invalidMoveFour];

		var seq = state.sequence.slice(0);

		for (var i = 0, len = numbers.length; i < len; i++) {
			if (inArray(parseInt(numbers[i]), seq) == -1) return ['replu', messages.invalidMoveIndex.replace('{0}', i + 1)];
			seq.splice(seq.indexOf(parseInt(numbers[i])), 1);
		}

		var str;

		if (eval(eq) == 24) {
			str = eq + ' == 24! ' + messages.win;
			updateStats(0)
			end();
		} else {
			str = eq +' == '+ eval(eq) +' != 24 '+ messages.lose;
			updateStats(2)
		}

		return ['reply', str];
	};

	var status = function(res) {
		state.res = res;
		return ['send', draw()];
	}

	return { start, play, status };
}
