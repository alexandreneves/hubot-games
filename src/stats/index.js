// Author:
// aneves

module.exports = new function() {
	var db = require('../db/');

	var parseStats = function(data) {
		var payload = [];

		for (var k in data) {
			if (data[k].stats === 'undefined') continue;

			payload.push({
				player: k,
				win: data[k].stats.w,
				draw: data[k].stats.d,
				loss: data[k].stats.l,
				submission: data[k].stats.s,
				total: data[k].stats.w + data[k].stats.d + data[k].stats.l + data[k].stats.s
			});
		}

		return payload.length ? payload : false;
	};

	// PUBLIC METHODS

	var get = function(res, types) {
		var game = (res.match[0]).match(/^!(.+)\s/)[1];
		var stats = parseStats(db.get(game));

		if (!stats) return 'no stats found for this game';

		var payload = '';

		types = typeof types === 'undefined' ? [0, 1, 2, 3] : types;

		for (var i = 0, len = stats.length; i < len; i++) {
			var r = stats[i];
			payload += r.player;
			payload += ', ';
			payload += r.total +' Games';
			if (types.indexOf(0) +1) payload += ' / '+ r.win +' W';
			if (types.indexOf(1) +1) payload += ' / '+ r.draw +' D';
			if (types.indexOf(2) +1) payload += ' / '+ r.loss +' L';
			if (types.indexOf(3) +1) payload += ' / '+ r.submission +' S';
			payload += '\n';
		}

		return '```'+ payload + '```';
	};

	var update = function(payload) {
		var data = db.get(payload.game, payload.player);
		var type = payload.type;

		if (typeof data.stats === 'undefined') data.stats = {'w': 0, 'd': 0, 'l': 0, 's': 0};

		if (type === 0) data.stats.w++;
		if (type === 1) data.stats.d++;
		if (type === 2) data.stats.l++;
		if (type === 3) data.stats.s++;

		db.put(payload.game, payload.player, data);
	};

	return { get, update };
}
