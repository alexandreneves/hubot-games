module.exports = function() {
	var shuffle = require('knuth-shuffle').knuthShuffle;
	var db = require('../../db/');
	var messages = require('./messages');
	var stats = require('../../stats/');

	var path = 'data/rank_21.json';

	var state = {
		defaults: {
			bank: 100,
			bet: 5,
			decks: 6,
		},
		bet: null,
		bank: null,
		deck: null,
		hand: {
			player: [],
			dealer: [],
		},
		payload: null,
		res: null,
	};

	var end = function() {
		state.payload.callback(state.res);
	}

	var getDeck = function() {
		// var suits = ['c', 'd', 'h', 's'];
		var cards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
		var deck = [];
		var decks = [];

		// set deck
		for (var i = 0; i < 4; i++) {
			deck = deck.concat(cards);
		}

		// set decks (n * deck)
		for (var i = 0; i < state.defaults.decks; i++) {
			decks = decks.concat(deck);
		}

		return shuffle(decks);
	}

	var getCard = function() {
		return state.deck.pop();
	}

	var getCardValue = function(card) {
		if (card === 'J') return 10;
		if (card === 'Q') return 10;
		if (card === 'K') return 10;
		if (card === 'A') return 11;
		return card;
	}

	var getWinner = function() {
		var countPlayer = getCount(state.hand.player);
		var countDealer = getCount(state.hand.dealer);

		if (countDealer > 21) return playerWin();
		if (countPlayer > countDealer) return playerWin();
		if (countPlayer > 21 || countDealer > countPlayer) return playerLose();
		if (countPlayer === countDealer) return playerPush();
	}

	var getCount = function(hand) {
		var count = 0;

		for (var i = 0, len = hand.length;  i < len; i++) {
			count += getCardValue(hand[i]);
		}

		// aces check (1 vs 11)
		if (hand.indexOf('A') !== -1 && count > 21) {
			var aces = hand.filter(function(v) { return v === 'A'; });
			count = count - (aces.length * 10);
		}

		return count;
	}

	var getPlayerName = function() {
		return state.res.envelope.user.name
	}

	var getBankBalance = function() {
		var data = db.get('21', getPlayerName());
		return typeof data.bank === 'undefined' ? state.defaults.bank : data.bank;
	}

	var getBet = function() {
		var bet = (state.res.match[0]).match(/^!21 (?:start|s)(\s[0-9]*)?$/)[1];
		return typeof bet === 'undefined' ? state.defaults.bet : bet;
	}

	var updateBank = function() {
		var data = db.get('21', getPlayerName());
		data.bank = state.bank;
		db.put('21', getPlayerName(), data);
	}

	var updateStats = function(type) {
		stats.update({
			game: '21',
			player: getPlayerName(),
			type: type
		});
	}

	var playerWin = function(multiplier) {
		if (typeof multiplier === 'undefined') multiplier = 2;
		state.bank += state.bet * multiplier;
		updateBank();
		updateStats(0);
		end();
		return ['send', draw(end, 0)];
	}

	var playerPush = function() {
		state.bank = state.bank + state.bet;
		updateBank();
		updateStats(1);
		end();
		return ['send', draw(end, 1)];
	}

	var playerLose = function() {
		updateBank();
		updateStats(2);
		end();
		return ['send', draw(end, 2)];
	}

	var dealerMove = function() {
		while (getCount(state.hand.dealer) < 17) {
			state.hand.dealer.push(getCard());
		}

		return getWinner();
	}

	var draw = function(end, result) {
		var draw = '';

		draw += 'dealer - '+ state.hand.dealer.join(', ') + ' ('+ getCount(state.hand.dealer) +')';
		draw += '\n';
		draw += 'player - '+ state.hand.player.join(', ') + ' ('+ getCount(state.hand.player) +')';

		if (typeof end !== 'undefined') {
			draw += '\n\n';
			draw += '@'+ getPlayerName() +' ';
			if (result === 0) draw += messages.win;
			if (result === 1) draw += messages.push;
			if (result === 2) draw += messages.lose;
			draw += '\n\n';
			draw += 'bank: '+ state.bank +'\n\n';
		}

		return draw;
	}

	// PUBLIC METHODS

	var start = function(res, payload) {
		state.res = res;
		state.payload = payload;

		state.bank = getBankBalance();
		state.bet = getBet();

		// check funds
		if (state.bet > state.bank) {
			end();
			return ['reply', messages.insufficientFunds];
		}

		// update bank
		state.bank = state.bank - state.bet;

		// get deck
		state.deck = getDeck();

		// deal
		state.hand.player.push(getCard());
		state.hand.dealer.push(getCard());
		state.hand.player.push(getCard());
		state.hand.dealer.push(getCard());

		var countPlayer = getCount(state.hand.player);
		var countDealer = getCount(state.hand.dealer);

		if (countPlayer === 21 && countDealer === 21) return playerPush();
		if (countPlayer === 21) return playerWin(2.5);
		if (countDealer === 21) return playerLose();

		return ['send', draw()];
	};

	var hit = function(res) {
		state.res = res;

		// deal new card
		state.hand.player.push(getCard());

		var count = getCount(state.hand.player);

        if (count > 21) return playerLose();
		if (count === 21) return dealerMove();

		return ['send', draw()];
	}

	var stand = function(res) {
		state.res = res;
		return dealerMove();
	}

	var double = function(res) {
		state.res = res;
	}

	var split = function(res) {
		state.res = res;
	}

	var insurance = function(res) {
		state.res = res;
	}

	return { start, hit, stand, double, split, insurance };
}