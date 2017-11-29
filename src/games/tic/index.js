module.exports = function() {
	var messages = require('./messages');
	var stats = require('../../stats/');
	var state = {
		players: [],
		turn: Math.floor(Math.random() * 2),
		grid: [-1, -1, -1, -1, -1, -1, -1, -1, -1],
		payload: null,
	};

	var end = function(res) {
		state.payload.callback(res);
	};

	var toggleTurn = function() {
		state.turn = !state.turn ? 1 : 0;
	};

	var isPlayerTurn = function(res) {
		return state.players[state.turn] === getPlayerName(res);
	};

	var hasWinner = function() {
		return hRowIsValid() || vRowIsValid() || dRowIsValid();
	};

	var hasMoves = function() {
		for (var i = 0, len = state.grid.length; i < len; i++) {
			if (state.grid[i] === -1) return true;
		}
		return false;
	};

	var getPlayerName = function(res) {
		return res.envelope.user.name;
	};

	var compareRows = function(a, b, c) {
		return (a === b && b === c && a === c) ? true : false;
	};

	var hRowIsValid = function() {
		var grid = state.grid;
		if ((compareRows(grid[0], grid[1], grid[2])) && grid[0] !== -1) return true;
		if ((compareRows(grid[3], grid[4], grid[5])) && grid[3] !== -1) return true;
		if ((compareRows(grid[6], grid[7], grid[8])) && grid[6] !== -1) return true;
		return false;
	};

	var vRowIsValid = function() {
		var grid = state.grid;
		if ((compareRows(grid[0], grid[3], grid[6])) && grid[0] !== -1) return true;
		if ((compareRows(grid[1], grid[4], grid[7])) && grid[1] !== -1) return true;
		if ((compareRows(grid[2], grid[5], grid[8])) && grid[2] !== -1) return true;
		return false;
	};

	var dRowIsValid = function() {
		var grid = state.grid;
		if ((compareRows(grid[0], grid[4], grid[8])) && grid[0] !== -1) return true;
		if ((compareRows(grid[2], grid[4], grid[6])) && grid[2] !== -1) return true;
		return false;
	};

	var draw = function() {
		var board = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
		var grid = state.grid;
		var payload = '';

		for (var i = 0, len = grid.length; i < len; i++) {
			if (grid[i] === 0) board[i] = 'heavy_multiplication_x';
			if (grid[i] === 1) board[i] = 'red_circle';

			payload += ':'+ board[i] +': ';

			if ((i + 1) % 3 === 0) payload += '\n';
		}

		return payload;
	}

	// PUBLIC METHODS

	var start = function(res, payload) {
		state.payload = payload;
		state.players.push(res.envelope.user.name);
		return ['reply', messages.started];
	};

	var join = function(res) {
		state.players.push(res.envelope.user.name);
		res.send(messages.firstPlayer.replace('{0}', state.players[state.turn]));
		return draw();
	};

	var play = function(res) {
		if (!isPlayerTurn(res)) return ['reply', messages.waitTurn];

		var selected = parseInt((res.match[0]).match(/^!tic (?:play|p) ([0-9]){1}$/)[1]) - 1;

		// validate move
		if (state.grid[selected] !== -1) return ['reply', messages.invalidMove];

		// update grid
		state.grid[selected] = state.turn;

		if (hasWinner()) {
			// winner
			stats.update({
				game: 'tic',
				player: state.players[state.turn],
				type: 0
			});

			// looser
			stats.update({
				game: 'tic',
				player: state.players[!state.turn ? 1 : 0],
				type: 2
			});

			end(res);

			return ['send', messages.winner.replace('{0}', state.players[state.turn])];
		}

		if (!hasMoves()) {
			stats.update({
				game: 'tic',
				player: state.players[state.turn],
				type: 1
			});

			stats.update({
				game: 'tic',
				player: state.players[!state.turn ? 1 : 0],
				type: 1
			});

			end(res);

			return ['send', messages.draw];
		}

		toggleTurn();

		return ['send', draw()];
	};

	return { start, join, play };
}
