module.exports = function() {
	var shuffle = require('knuth-shuffle').knuthShuffle;
	var db = require('../../db/');
	var messages = require('./messages');
	var stats = require('../../stats/');

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
		credit: false,
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
		if (['J', 'Q', 'K'].indexOf(card) +1) return 10;
		if (card === 'A') return 11;
		return card;
	}

	var getWinner = function() {
		var countPlayer = getCount(state.hand.player);
		var countDealer = getCount(state.hand.dealer);

		if (countPlayer > 21) return playerLose(); // player bust
		if (countDealer > 21) return playerWin(); // dealer bust
		if (countPlayer > countDealer) return playerWin(); // player has better hand
		if (countDealer > countPlayer) return playerLose(); // dealer has better hand
		if (countPlayer === countDealer) {
			if (countPlayer === 21) { // check for blackjacks
				var cardsPlayer = state.hand.player.length;
				var cardsDealer = state.hand.dealer.length;

				if (cardsPlayer === cardsDealer) return playerPush(); // tie
				if (cardsPlayer === 2) return playerWin();
				if (cardsDealer === 2) return playerLose();
			}

			// no blackjacks, push
			return playerPush();
		}
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
		return typeof bet === 'undefined' ? state.defaults.bet : parseInt(bet);
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

	var playerWin = function() {
		var multiplier = getCount(state.hand.player) === 21 ? 2.5 : 2;
		state.bank += state.bet * multiplier;
		updateBank();
		updateStats(0);
		end();
		return ['reply', draw(end, 0)];
	}

	var playerPush = function() {
		state.bank = state.bank + state.bet;
		updateBank();
		updateStats(1);
		end();
		return ['reply', draw(end, 1)];
	}

	var playerLose = function() {
		updateBank();
		updateStats(2);
		end();
		return ['reply', draw(end, 2)];
	}

	var dealerMove = function() {
		while (getCount(state.hand.dealer) < 17) {
			state.hand.dealer.push(getCard());
		}

		// check for s17
		var acesCount = ((state.hand.dealer.join('')).match(/a/ig) || []).length;
		if (getCount(state.hand.dealer) === 17 && acesCount === 1) {
			state.hand.dealer.push(getCard());
		}

		return getWinner();
	}

	var draw = function(end, result) {
		var draw = '';

		draw += 'dealer: '+ state.hand.dealer.join(', ') + ' ('+ getCount(state.hand.dealer) +')';
		draw += '\n';
		draw += 'player: '+ state.hand.player.join(', ') + ' ('+ getCount(state.hand.player) +')';

		if (typeof end !== 'undefined') {
			draw += '\n\n';
			if (result === 0) {
				if (getCount(state.hand.player) === 21 && state.hand.player.length === 2) {
					draw += messages.win21;
				} else {
					draw += messages.win;
				}
			}
			if (result === 1) draw += messages.push;
			if (result === 2) draw += messages.lose;
			draw += '\n\n';
			draw += 'bank: '+ state.bank;
			if (result === 0 && state.credit) draw += messages.creditDeducted
		}

		return '```'+ draw +'```';
	}

	// PUBLIC METHODS

	var start = function(res, payload) {
		state.res = res;
		state.payload = payload;

		state.bank = getBankBalance();
		state.bet = getBet();

		if (state.bank < state.defaults.bet) { // user has insufficient funds
			state.credit = true; // default bet credited
			state.res.reply(messages.insufficientFunds);
		} else if (state.bet < state.defaults.bet) { // check if bet is valid
			end();
			return ['reply', messages.betInvalid];
		}

		// update bank
		state.bank = state.bank - state.bet;

		// get deck
		state.deck = getDeck();

		// deal
		state.hand.player.push(getCard());
		state.hand.dealer.push(getCard());
		state.hand.player.push(getCard());

		// check for blackjack
		if (getCount(state.hand.player) === 21) return dealerMove();

		return ['reply', draw()];
	};

	var hit = function(res) {
		state.res = res;

		// deal new card
		state.hand.player.push(getCard());

		var count = getCount(state.hand.player);

        if (count > 21) return playerLose();
		if (count === 21) return dealerMove();

		return ['reply', draw()];
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
