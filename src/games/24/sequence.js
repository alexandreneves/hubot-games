module.exports = function() {
	var allowed_sequences = [
		[8, 6, 2, 2], [4, 5, 2, 2],
		[8, 4, 2, 2], [8, 7, 1, 8],
		[4, 8, 4, 5], [4, 9, 8, 8]
		[8, 8, 4, 4], [6, 5, 1, 1],
		[7, 3, 4, 5], [5, 6, 6, 7],
		[9, 2, 1, 5], [7, 7, 4, 6],
		[2, 5, 9, 3], [6, 4, 3, 8],
		[4, 3, 3, 8], [1, 8, 8, 4],
		[5, 1, 8, 8], [7, 7, 7, 3],
		[1, 8, 2, 9], [2, 1, 3, 4],
		[3, 2, 6, 3], [2, 6, 4, 3],
		[1, 5, 2, 8], [5, 4, 1, 5],
		[1, 7, 2, 6], [5, 7, 8, 4],
		[8, 1, 6, 9], [6, 6, 9, 3],
		[8, 4, 2, 8], [5, 7, 7, 5],
		[6, 4, 8, 6], [5, 7, 8, 1],
		[8, 8, 6, 1], [1, 3, 4, 3],
		[1, 4, 1, 7], [2, 7, 2, 1],
		[5, 2, 1, 6], [1, 9, 2, 1],
		[8, 8, 3, 7], [5, 3, 4, 5],
		[1, 4, 1, 8], [5, 6, 3, 3],
		[4, 6, 2, 2], [1, 6, 6, 2],
		[4, 7, 2, 2], [8, 6, 5, 4],
		[4, 5, 3, 3], [7, 4, 1, 5],
		[8, 9, 8, 7], [6, 8, 7, 2],
		[8, 9, 8, 3], [6, 8, 5, 6],
		[4, 9, 1, 2], [4, 2, 4, 6],
		[1, 9, 1, 6], [7, 4, 2, 3],
		[2, 6, 7, 4], [1, 9, 7, 6],
		[1, 3, 3, 7], [2, 7, 1, 8],
		[5, 5, 9, 2], [2, 5, 2, 6],
		[9, 1, 6, 5], [1, 8, 4, 4],
		[4, 1, 4, 9], [3, 8, 3, 2],
		[4, 9, 6, 5], [2, 6, 2, 3],
		[2, 9, 8, 2], [7, 5, 3, 6],
		[3, 9, 4, 5], [4, 3, 4, 5],
		[6, 2, 6, 3], [3, 4, 2, 4],
		[5, 3, 6, 1], [7, 6, 7, 5],
		[4, 7, 3, 4], [5, 2, 6, 3],
		[6, 2, 6, 8], [8, 7, 8, 2],
		[4, 6, 4, 5], [7, 2, 1, 3],
		[8, 5, 3, 1], [4, 8, 7, 8],
		[2, 8, 2, 7], [2, 6, 8, 5],
		[3, 7, 4, 1], [6, 5, 8, 7],
		[2, 5, 3, 4], [4, 9, 2, 6],
		[2, 4, 7, 4], [8, 9, 8, 2],
		[5, 8, 2, 3], [7, 2, 7, 8],
		[7, 2, 7, 3], [2, 8, 2, 4],
		[2, 9, 4, 8], [7, 1, 7, 4],
		[2, 5, 7, 7], [7, 5, 7, 4],
		[3, 6, 4, 5], [1, 6, 2, 3],
		[1, 9, 2, 6], [1, 9, 4, 7],
		[3, 8, 5, 6], [2, 4, 3, 8],
		[1, 9, 5, 7], [3, 9, 3, 5],
		[1, 7, 3, 5], [2, 9, 3, 6],
		[3, 8, 6, 6], [2, 9, 6, 6],
		[1, 8, 3, 6], [2, 7, 3, 3],
		[1, 7, 2, 4], [3, 8, 3, 7],
		[1, 7, 3, 6], [5, 8, 5, 6],
		[1, 9, 3, 5], [1, 8, 5, 6],
		[2, 8, 3, 7], [1, 5, 6, 6],
		[1, 7, 4, 4], [1, 6, 4, 4],
		[3, 7, 5, 5], [3, 7, 3, 4],
		[2, 7, 4, 5], [1, 6, 5, 5],
		[2, 6, 4, 6], [3, 9, 6, 8],
		[1, 8, 2, 8], [3, 9, 4, 7],
		[1, 8, 3, 7], [2, 7, 2, 3],
		[2, 8, 4, 7], [2, 6, 4, 5],
		[2, 6, 5, 6], [8, 9, 6, 2],
		[3, 8, 1, 8], [9, 7, 2, 5],
		[2, 6, 5, 6], [2, 8, 3, 6],
		[2, 5, 4, 4], [3, 7, 3, 5],
		[2, 7, 3, 5], [3, 8, 3, 6],
		[2, 5, 3, 2], [1, 9, 4, 6],
		[1, 7, 5, 6], [1, 7, 4, 6],
		[4, 3, 4, 9], [2, 4, 7, 9],
		[4, 4, 7, 8], [2, 5, 5, 8],
		[3, 9, 5, 8], [3, 8, 4, 7],
		[1, 2, 2, 8], [2, 2, 5, 8],
		[2, 6, 9, 2], [2, 8, 4, 6],
		[2, 3, 9, 7], [5, 9, 7, 8],
		[2, 8, 5, 8], [2, 9, 3, 8],
		[1, 8, 4, 3], [5, 4, 5, 7],
		[2, 3, 5, 3], [5, 9, 8, 8],
		[3, 4, 7, 7], [1, 2, 5, 4],
		[5, 6, 9, 6], [2, 7, 2, 5],
		[1, 8, 4, 6], [1, 6, 4, 6],
		[2, 9, 2, 5], [3, 5, 8, 8],
		[4, 8, 4, 9], [7, 5, 8, 8],
		[4, 6, 4, 8], [2, 5, 4, 5],
		[2, 9, 5, 6], [3, 3, 3, 5],
		[1, 8, 4, 5], [2, 9, 7, 8],
		[2, 7, 3, 6], [24, 6, 8, 2],
		[10, 11, 6, 2], [4, 11, 5, 2],
	];

	var get_new_sequence = function() {
		return allowed_sequences[Math.floor(Math.random() * allowed_sequences.length)];
	};

	return { get_new_sequence };
}