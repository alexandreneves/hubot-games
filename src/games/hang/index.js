module.exports = function() {
	var stats = require('../../stats/');
    var words = require('./words');
    var messages = require('./messages');
    var state = {
		player: null,
        lives: 6,
        word: null,
        letters: {
            correct: [],
            total: []
        },
		payload: null,
		res: null,
    };

	var end = function() {
		state.payload.callback(state.res);
	};

    var getRandomWord = function() {
        return words[Math.floor(Math.random() * words.length)];
    };

	var updateStats = function(type) {
		stats.update({
			game: 'hang',
			player: state.player,
			type: type
		});
	}

	var isComplete = function() {
		var lettersFound = 0;

		for (var i = 0, len = state.word.length; i < len; i++) {
			if (state.letters.correct.indexOf(state.word[i]) !== -1) {
				lettersFound++;
			}
		}

		return state.word.length === lettersFound;
	};

	var playLetter = function(letter) {
		if (state.letters.total.indexOf(letter) !== -1) return 'invalid';

		state.letters.total.push(letter);

		if (state.word.indexOf(letter) !== -1) {
			state.letters.correct.push(letter);
			return isComplete() ? 'complete' : 'correct';
		}

		state.lives--;

		return 'wrong';
	};

	var playWord = function(guess) {
		if (guess === state.word) {
			return 'complete';
		} else {
			state.lives = 0;
			return 'wrong';
		}
	};

	var drawState = function(complete) {
		var payload = '';

		var timeNow = new Date();
		var timeRemaining = new Date(state.payload.timeoutTime - (timeNow.getTime() - state.payload.timestamp));

		payload += 'lives: '+ state.lives;
		payload += '\n';
		payload += 'letters: '+ state.letters.total.join(', ');
		payload += '\n';
		payload += 'time: '+ timeRemaining.getMinutes() +':'+ ('0' + timeRemaining.getSeconds()).slice(-2);
		payload += '\n';
		payload += 'state: '+ drawWord(complete, false);

		return '```'+ payload +'```';
	}

	var drawWord = function(complete, quotes) {
		var payload = '';
		var letters = complete ? state.word.split('') : state.letters.correct;

		for (var i = 0, len = state.word.length; i < len; i++) {
			// 		? ':regional_indicator_'+ state.word[i] +': '
			// 		: ':white_circle: ';

			payload += letters.indexOf(state.word[i]) !== -1
				? state.word[i].toUpperCase() +' '
				: '_ ';
		}

		return typeof quotes === 'undefined' ? '```'+ payload +'```' : payload;
	};

	// PUBLIC METHODS

	var start = function(res, payload) {
		state.res = res;
		state.payload = payload;

		state.player = state.res.envelope.user.name;
		state.lives = 6;
		state.letters = {
			correct: [],
			total: []
		};
		state.word = getRandomWord();

		return ['reply', messages.started.replace('{0}', state.word.length)];
	};

	var play = function(res) {
		state.res = res;

		var payload = state.res.match[0].split(' ')[2];
		var result = payload.length === 1 ? playLetter(payload) : playWord(payload);

		switch (result) {
			case 'invalid':
				return ['reply', messages.letterAlreadyPlayed.replace('{0}', payload)];
			case 'correct':
				return ['reply', drawWord()];
			case 'complete':
				updateStats(0)
				end();
				return ['reply', messages.winner + drawState(state.res, true)];
			case 'wrong':
				if (state.lives) {
					return ['reply', messages.guessWrong.replace('{0}', payload).replace('{1}', state.lives)];
				} else {
					updateStats(2);
					end();
					return ['reply', messages.gameover + drawState(state.res, true)];
				}
		}
	};

	var status = function(res, complete) {
		state.res = res;
		complete = typeof complete !== 'undefined' ? complete : false;
		return ['reply', drawState(complete)];
	};

	return { start, play, status };
}
