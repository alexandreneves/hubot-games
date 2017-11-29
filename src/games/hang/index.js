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
		payload: null
    };

    var getRandomWord = function() {
        return words[Math.floor(Math.random() * words.length)];
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

	var isComplete = function() {
		var lettersFound = 0;

		for (var i = 0, len = state.word.length; i < len; i++) {
			if (state.letters.correct.indexOf(state.word[i]) !== -1) {
				lettersFound++;
			}
		}

		return state.word.length === lettersFound;
	};

	var end = function(res) {
		state.payload.callback(res);
	};

	var word = function() {
		return state.word;
	};

	// PUBLIC METHODS

	var start = function(res, payload) {
		state.player = res.envelope.user.name;
		state.lives = 6;
		state.letters = {
			correct: [],
			total: []
		};
		state.word = getRandomWord();
		state.payload = payload;

		return ['reply', messages.started.replace('{0}', state.word.length)];
	};

	var play = function(res) {
		var payload = res.match[0].split(' ')[2];
		var result = payload.length === 1 ? playLetter(payload) : playWord(payload);

		switch (result) {
			case 'invalid':
				return ['reply', messages.wordRepeated.replace('{0}', payload)];
			case 'correct':
				return ['send', wordOutput()];
			case 'complete':
				stats.update({
					game: 'hang',
					player: state.player,
					type: 0
				});
				end(res);
				return ['reply', messages.winner.replace('{0}', wordOutput(true))];
			case 'wrong':
				if (state.lives) {
					return ['reply', messages.guessWrong.replace('{0}', payload).replace('{1}', state.lives)];
				} else {
					stats.update({
						game: 'hang',
						player: state.player,
						type: 2
					});
					end(res);
					return ['reply', messages.gameover.replace('{0}', wordOutput(true))];
				}
		}
	};

	var state = function() {
		var payload = '';

		var timeNow = new Date();
		var timeRemaining = new Date(state.payload.timeoutTime - (timeNow.getTime() - state.payload.timestamp));

		payload += '\n';
		payload += 'lives: '+ state.lives;
		payload += '\n';
		payload += 'letters: '+ state.letters.total.join(', ');
		payload += '\n';
		payload += 'time: '+ timeRemaining.getMinutes() +':'+ ('0' + timeRemaining.getSeconds()).slice(-2);
		payload += '\n';
		payload += 'state: '+ wordOutput();

		return ['reply', payload];
	};

	var wordOutput = function(full) {
	    var payload = '';
		var letters = full ? state.word.split('') : state.letters.correct;

	    for (var i = 0, len = state.word.length; i < len; i++) {
            payload += letters.indexOf(state.word[i]) !== -1
				? ':regional_indicator_'+ state.word[i] +': '
				: ':white_circle: ';
		}

	    return payload;
	};

	return { start, play, state, wordOutput };
}
