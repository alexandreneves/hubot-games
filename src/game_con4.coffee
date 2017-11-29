# Author
# tiagocunha

module.exports = (robot) ->
	board = [[0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0]]

	# 0 - OFF
	# 1 - WAITING FOR PLAYERS
	# 2 - STARTED
	gameStarted = 0
	nextPlayer = ""
	p1 = ""
	p2 = ""

	robot.hear /\!con4 start$/i, (res) ->
		if gameStarted == 1 || gameStarted == 2
			res.reply "A Game has already started. Please wait for it to finish"
			return
		p1 = res.message.user.name
		gameStarted = 1

		board = [[0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0]]

		res.reply "Game Started. Waiting for a player to join"

	robot.hear /\!con4 join$/i, (res) ->
		if gameStarted != 1
			res.reply "Can't join this game."
			return
		p2 = res.message.user.name
		gameStarted = 2
		nextPlayer = p1
		res.reply "Joined game. " + "It's @" + nextPlayer + "'s turn."

	robot.hear /\!con4 stat/i, (res) ->
		return unless gameStarted == 2
		str = p1 + " vs " + p2 + "\n"
		max_row = 6
		max_col = 7
		for i in [0...max_row]
			for j in [0...max_col]
				str += switch
					when board[i][j] == 0 then ":white_large_square: "
					when board[i][j] == 1 then ":red_circle: "
					when board[i][j] == 2 then ":large_blue_circle: "
			str += "\n"
		str += ":one: :two: :three: :four: :five: :six: :seven:"
		res.send str

	robot.hear /\!con4 rank/i, (res) ->
		res.send "In work"

	robot.hear /\!con4 play\s*([1-7]$)/i, (res) ->
		return unless gameStarted == 2
		return unless nextPlayer == res.message.user.name

		user_col = res.match[1] - 1
		if board[0][user_col] != 0
			res.send "Move not possible.\n"
			return

		if res.message.user.name == p1
			nextPlayer = p2
			token = 1
		else
			nextPlayer = p1
			token = 2

		max_row = 6
		max_col = 7
		i = 1
		while(board[max_row - i][user_col] != 0)
			if i == max_row + 1
				res.send "Invalid move"
				return
			else
				i++

		board[max_row - i][user_col] = token # Place move on board
		str = ""
		for i in [0...max_row]
			for j in [0...max_col]
				str += switch
					when board[i][j] == 0 then ":white_large_square: "
					when board[i][j] == 1 then ":red_circle: "
					when board[i][j] == 2 then ":large_blue_circle: "
			str += "\n"
		str += ":one: :two: :three: :four: :five: :six: :seven:"

		if evaluateRowsWin(board, token) || evaluateColsWin(board, token) || evaluateDiagonalsWin(board, token)
			str += "\n\n:fireworks: " + res.message.user.name + " is victorious. Saving statistics to brain."
			gameStarted = 0
			#updateOfflineRanking(res.message.user.name, nextPlayer) #Winner, Loser
		else
			str += "\n\n It's @" + nextPlayer + "'s turn."

		res.send str

evaluateRowsWin = (board, token) ->
	max_row = 6
	max_col = 4
	for i in [0...max_row]
		for j in [0...max_col]
			if evalEqual(board[i][j], board[i][j+1], board[i][j+2], board[i][j+3], token)
				return true
	return false

evaluateColsWin = (board, token) ->
	max_row = 3
	max_col = 6
	for i in [0...max_row]
		for j in [0...max_col]
			if evalEqual(board[i][j], board[i+1][j], board[i+2][j], board[i+3][j], token)
				return true
	return false

evaluateDiagonalsWin = (board, token) ->
	half_row = 3
	max_row = 6
	half_col = 3
	max_col = 7
	for i in [0...half_row]
		for j in [0...half_col]
			if evalEqual(board[i][j], board[i+1][j+1], board[i+2][j+2], board[i+3][j+3], token)
				return true

	for i in [half_row...max_row]
		for j in [0...half_col]
			if evalEqual(board[i][j], board[i-1][j+1], board[i-2][j+2],board[i-3][j+3], token)
				return true

	return false

evalEqual = (pos1, pos2, pos3, pos4, token) ->
	if pos1 == token && pos2 == token && pos3 == token && pos4 == token
		return true
	return false
