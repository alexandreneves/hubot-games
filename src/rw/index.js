// Author:
// aneves

module.exports = new function() {
    var fs = require('fs');
	var path = require('path');

	var getFilePath = function(p) {
		return path.resolve(__dirname, '../'+ p);
	};

	// PUBLIC METHODS

	var read = function(path) {
		var filePath = getFilePath(path);

		try { // try reading and existing file
			var file = fs.statSync(filePath);
			return JSON.parse(fs.readFileSync(filePath, 'utf8'));
		} catch(err) {
			if (err.code === 'ENOENT') { // not found
				try { // try creating one
					var file = fs.openSync(filePath, 'a');
					fs.writeFileSync(file, '{}');
					return JSON.parse('{}');
				} catch(err) { // err
					console.log(err);
				}
			}
		}

		return false;
	};

    var write = function(path, data) {
        fs.writeFileSync(getFilePath(path), JSON.stringify(data));
    };

	return { read, write };
}
