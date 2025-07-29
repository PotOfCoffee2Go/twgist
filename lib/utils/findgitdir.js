/*\
 * Reverse search for .git directories 
 * version: 1.0.0
 * created: 2025-07-19
 * author: PotOfCoffee2Go
 * license: MIT
\*/

var fs = require('fs-extra')
var path = require('node:path')

exports.findGitDir = function findGitDir(base, result) {
	result = result || [] 
	
	// Skip directories that do not exist
	if (fs.existsSync(path.resolve(base))) {
		if (fs.readdirSync(path.resolve(base)).includes(".git")) {
			result.push(path.resolve(base));
		}
		if (path.resolve(base, '..') !== '/') { 
			findGitDir(path.resolve(base, '..'), result);
		}
	} else {
		findGitDir(path.resolve(base, '..'), result);
	}
	return result;
}
