module.exports = function() {
    var shuffle = require('knuth-shuffle').knuthShuffle;
    var stats = require('../../stats/');
	var messages = require('./messages');

    questions = {
        easy: require('./questions/easy'),
        medium: require('./questions/medium'),
        hard: require('./questions/hard')
    };

    var state = {
        level: 1,
        currentQuestion: {},
        answers: [],
		payload: null,
		res: null,
    };

    var generateRandomLevel = function() {
        return Math.floor(Math.random() * 3) + 1;
    };

    var getQuestion = function() {
        var randomQuestion = {};
		var pos = 0;

        switch (state.level) {
            case 1:
                pos = Math.floor(Math.random() * questions.easy.length);
                randomQuestion = questions.easy[pos];
                break;
            case 2:
                pos = Math.floor(Math.random() * questions.medium.length);
                randomQuestion = questions.medium[pos];
                break;
            case 3:
                pos = Math.floor(Math.random() * questions.hard.length);
                randomQuestion = questions.hard[pos];
                break;
            default:
                pos = Math.floor(Math.random() * questions.medium.length);
                randomQuestion = questions.medium[pos];
                break;
        }

        return randomQuestion;
    };

    var sortAnswers = function() {
        var answers = state.currentQuestion.incorrect_answers;
        answers.push(state.currentQuestion.correct_answer);
        state.answers = shuffle(answers.slice(0));
    };

    var messageOutput = function() {
        var msg = getLevelStr().toUpperCase() +': '+ state.currentQuestion.question + '\n';
        for (var i = 0; i < 4; i++) {
            msg += (i + 1) + ") " + state.answers[i] + "\n";
        }
        return '```'+ msg +'```';
    };

    var getLevelStr = function() {
		if (state.level === 1) return 'Easy';
		if (state.level === 2) return 'Medium';
		if (state.level === 3) return 'Hard';
		if (state.level === 4) return 'Medium';
    };

    var checkAnswer = function(guess) {
        return state.answers[--guess] === state.currentQuestion.correct_answer;
    };

    var end = function() {
		state.payload.callback(state.res);
	};

    // PUBLIC METHODS

    var start = function(res, payload) {
		state.res = res;
		state.payload = payload;

        state.level = generateRandomLevel();
        state.currentQuestion = getQuestion();

		sortAnswers();

		return ['send', messageOutput()];
    };

    var play = function(res) {
		state.res = res;

        var payload = res.match[0].split(' ')[2];
        var guess = res.match[0].trim().split('!quiz p ')[1];
        var result = checkAnswer(parseInt(guess));

        stats.update({
            game: 'quiz',
            player: res.envelope.user.name,
            type: result ? 0 : 2
        });

        end();

        return (result)
			? ['reply', messages.correctAnswer]
			: ['reply', messages.gameOver.replace('{0}', state.currentQuestion.correct_answer)];
    };

    var answerOutput = function() {
        return state.currentQuestion.correct_answer;
    };

    return { start, play, answerOutput };
}
