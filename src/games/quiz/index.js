module.exports = function() {
    var shuffle = require('knuth-shuffle').knuthShuffle;
    var stats = require('../../stats/');
    questions = {
        easy: require('./questions/easy'),
        medium: require('./questions/medium'),
        hard: require('./questions/hard')
    };
    var messages = require('./messages');

    var state = {
		player: null,
        level: 1,
        currentQuestion: {},
        answers: [],
		payload: null
    };

    var generateRandomLevel = function() {
        return Math.floor(Math.random() * 3) + 1;
    };

    var getQuestion = function() {
        var randomQuestion = {}, pos = 0;
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
        var msg = '*(' + getLevelStr() + ') ' + state.currentQuestion.question + '*\n';
        for (var i = 0; i < 4; i++) {
            msg += (i + 1) + ") " + state.answers[i] + "\n";
        }

        return msg;
    };

    var getLevelStr = function() {
        var lvlStr = '';

        switch (state.level) {
            case 1:
                lvlStr = 'Easy';
                break;
            case 2:
                lvlStr = 'Medium';
                break;
            case 3:
                lvlStr = 'Hard';
                break;
            case 2:
                lvlStr = 'Medium';
                break;
        }

        return lvlStr;
    };

    var checkAnswer = function(guess) {
        return (state.answers[--guess] === state.currentQuestion.correct_answer) ? true : false;
    };

    var end = function(res) {
		state.payload.callback(res);
	};

    // PUBLIC METHODS

    var start = function(res, payload) {
        
        state.player = res.envelope.user.name;
        //state.level = (typeof level === 'undefined') ? generateRandomLevel() : level;
        state.level = generateRandomLevel();
        state.currentQuestion = getQuestion();
        sortAnswers();
        state.payload = payload;
        
        return ['send', messageOutput()];
    };

    var play = function(res) {
        var payload = res.match[0].split(' ')[2];
        var guess = res.match[0].trim().split('!quiz p ')[1];
        var result = checkAnswer(parseInt(guess));

        for (var i = 0; i < state.level; i++) {
            stats.update({
                game: 'quiz',
                player: state.player,
                type: result ? 0 : 2
            });
        }

        end(res);
        return (result) ? ['reply', messages.correctAnswer] : 
        ['reply', messages.gameOver.replace('{0}', state.currentQuestion.correct_answer)];
    };

    var answerOutput = function() {
        return state.currentQuestion.correct_answer;
    };

    return { start, play, answerOutput };
}