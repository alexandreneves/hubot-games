module.exports = new function() {
	var rw = require('../rw/');
	var db = 'db.json';

	// PUBLIC METHODS

	var get = function(game, player) {
		var data = rw.read(db);

		if (typeof data === 'undefined') return {};
		if (typeof data[game] === 'undefined') return {};

		if (typeof player === 'undefined') return data[game];

		if (typeof data[game][player] === 'undefined') return {};

		return data[game][player];
	};

	var put = function(game, player, payload) {
		var data = rw.read(db);
		var empty = {};

		if (typeof data[game] === 'undefined') data[game] = {};
		if (typeof data[game][player] === 'undefined') data[game][player] = {};

		data[game][player] = payload;

		rw.write(db, data);
	};

	return { get, put };
}
