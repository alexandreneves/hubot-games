module.exports = function(payload) {
	var messages = require('./messages');
	var sessions = {};

	var id = payload.id;
	var game = payload.game;
	var timeout = typeof payload.timeout !== 'undefined' ? payload.timeout : false;
	var interval = typeof payload.interval !== 'undefined' ? payload.interval : false;
	var numberOfPlayers = typeof payload.players !== 'undefined' ? payload.players : 1;

	// SESSION HANDLERS

	var deleteSession = function(res) {
		var session = getSession(res);
		if (typeof session.timeout !== 'undefined') clearTimeout(session.timeout);
		if (typeof session.interval !== 'undefined') clearInterval(session.interval);
		delete sessions[getSessionIndex(res)];
	};

	var sessionTimeout = function(res) {
		return setTimeout(function() {
			timeout.callback(res);
			deleteSession(res);
		}, timeout.time)
	};

	var sessionInterval = function(res) {
		return setInterval(function() {
			interval.callback(res);
		}, interval.time);
	}

	// HELPERS

	var hasSession = function(res) {
		return getSession(res) === false ? false : true;
	};

	var getSession = function(res) {
		var player = getPlayerName(res);

		if (typeof sessions[player] !== 'undefined') return sessions[player];

		for (var s in sessions) {
			if (sessions[s].players.indexOf(player) +1) return sessions[s];
		}

		return false;
	}

	var getSessionIndex = function(res) {
		var player = getPlayerName(res);
		if (typeof sessions[player] !== 'undefined') return player;

		for (var s in sessions) {
			if (sessions[s].players.indexOf(player) +1) return s;
		}
	}

	var getGameInstance = function(res) {
		return getSession(res)['instance'];
	};

	var getGameName = function(res) {
		return (res.match[0]).match(/^!(.+)\s$/)[1];
	}

	var getPlayerName = function(res) {
		return res.envelope.user.name
	}

	var findWaitingSession = function(res) {
		for (var s in sessions) {
			if (sessions[s].isWaitingForPlayers) return sessions[s];
		}
		return false;
	}

	// PUBLIC METHODS

	var start = function(res) {
		if (hasSession(res)) return ['reply', messages.sessionFound];
		if (findWaitingSession(res)) return ['reply', messages.sessionWaitingForPlayers];

		sessions[getPlayerName(res)] = {
			instance: new game(),
			timeout: timeout ? sessionTimeout(res) : false,
			interval: interval ? sessionInterval(res) : false,
			timestamp: new Date(),
			players: [],
			isWaitingForPlayers: numberOfPlayers > 1 ? true : false,
		};

		return getGameInstance(res).start(res, {
			timestamp: sessions[getPlayerName(res)].timestamp,
			timeoutTime: timeout ? timeout.time : false,
			callback: deleteSession
		});
	};

	var join = function(res) {
		if (hasSession(res)) return ['reply', messages.sessionFound];

		var session = findWaitingSession(res);

		if (!session) return ['reply', messages.sessionWaitingForPlayersNotFound];

		session.players.push(getPlayerName(res));

		if (session.players.length === numberOfPlayers - 1) session.isWaitingForPlayers = false;

		return ['send', session.instance.join(res)];
	};

	var action = function(action, res) {
		if (!hasSession(res)) return ['reply', messages.sessionNotFound];

		var session = getSession(res);

		if (session.isWaitingForPlayers) return ['reply', messages.sessionIsWaitingForPlayers];

		return getGameInstance(res)[action](res);
	};

	var gameInstance = function(res) {
		return hasSession(res) ? getGameInstance(res) : false;
	}

	return { start, join, action, gameInstance };
}
