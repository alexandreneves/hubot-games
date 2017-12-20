module.exports = function() {
	var stats = require('../../stats/');
	var messages = require('./messages');

	var state = {
		players: [],
		turn: Math.floor(Math.random() * 2),
		board: [
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
		],
		payload: null,
		res: null
	};

	var end = function() {
		state.payload.callback(state.res);
	};

	var isPlayerTurn = function() {
		return state.players[state.turn] === getPlayerName();
	};

	var getPlayerName = function() {
		return state.res.envelope.user.name;
	};

	var updateStats = function(type) {
		stats.update({
			game: '24',
			player: getPlayerName(),
			type: type
		});
	};

	var toggleTurn = function() {
		state.turn = !state.turn ? 1 : 0;
	};

	var draw = function() {
		var r = 6;
		var c = 7;
		var str = '';

		for (var ir = 0; ir < r; ir++) {
			for (var ic = 0; ic < c; ic++) {
				if (state.board[ir][ic] == 0) str += ':white_large_square: ';
				if (state.board[ir][ic] == 1) str += ':red_circle: ';
				if (state.board[ir][ic] == 2) str += ':large_blue_circle: ';
			}
			str += '\n';
		}

		str += ':one: :two: :three: :four: :five: :six: :seven:';

		return str;
	};

	var getMoveRow = function(col) {
		var i = 6;
		while (i--) {
			if (!state.board[i][col]) return i;
		}
		return false;
	};

	var rowsWin = function() {
		for (var r = 0; r < 6; r++) {
			for (var c = 0; c < 4; c++) {
				if (areEqual(state.board[r][c], state.board[r][c+1], state.board[r][c+2], state.board[r][c+3])) return true
			}
		}
		return false
	};

	var colsWin = function() {
		for (var r = 0; r < 3; r++) {
			for (var c = 0; c < 6; c++) {
				if (areEqual(state.board[r][c], state.board[r+1][c], state.board[r+2][c], state.board[r+3][c])) return true
			}
		}
		return false
	};

	var diagWin = function() {
		for (var r = 0; r < 3; r++) {
			for (var c = 0; c < 3; c++) {
				if (areEqual(state.board[r][c], state.board[r+1][c+1], state.board[r+2][c+2], state.board[r+3][c+3])) return true
			}
		}

		for (var r = 3; r < 6; r++) {
			for (var c = 0; c < 3; c++) {
				if (areEqual(state.board[r][c], state.board[r-1][c+1], state.board[r-2][c+2], state.board[r-3][c+3])) return true
			}
		}

		return false
	};

	var areEqual = function(p1, p2, p3, p4) {
		var t = state.turn + 1;
		return p1 == t && p2 == t && p3 == t && p4 == t;
	};

	// PUBLIC METHODS

	var start = function(res, payload) {
		state.res = res;
		state.payload = payload;
		state.players.push(res.envelope.user.name);
		return ['reply', messages.started];
	};

	var join = function(res) {
		state.res = res;
		state.players.push(res.envelope.user.name);
		res.send(messages.firstPlayer.replace('{0}', state.players[state.turn]));
		return draw();
	};

	var play = function(res) {
		state.res = res;

		if (!isPlayerTurn(res)) return ['reply', messages.waitTurn];

		var col = parseInt(res.match[1]) - 1;
		var row = getMoveRow(col);

		if (!row) return ['reply', messages.invalidMove];

		state.board[row][col] = state.turn + 1;

		res.send(draw());

		if (rowsWin() || colsWin() || diagWin()) {
			// winner
			stats.update({
				game: 'cf',
				player: state.players[state.turn],
				type: 0
			});

			// looser
			stats.update({
				game: 'cf',
				player: state.players[!state.turn ? 1 : 0],
				type: 2
			});

			end();

			return ['send', messages.win.replace('{0}', getPlayerName())];
		} else {
			toggleTurn();
			return ['send', messages.yourMove.replace('{0}', state.players[state.turn])];
		}
	};

	return { start, join, play };
}
