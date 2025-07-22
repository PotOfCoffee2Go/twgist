/*\
 * Create a 'server' edition TiddlyWiki from a Gist
 * 
 * usage: twgist <command> -s [port] ...
 * 
 * version: 1.0.0
 * created: 2025-07-19
 * author: PotOfCoffee2Go
 * license: MIT
\*/
const fs = require('fs-extra');
const os = require('node:os');
const { spawn } = require('node:child_process');

const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const isWin32 = os.platform() === 'win32';

// Spawned processes display on parent's output
const spawnOptions = { stdio: [process.stdin, process.stdout, process.stderr] };
if (isWin32) { spawnOptions.shell = true; }; // Windows requires shell to be true

// Spawn 'tiddlywiki ${twdir} --init server' command
function serverTiddlyWiki(twdir, port) {
	var params = [twdir, '--listen'];
	if ('' + port !== '8080') { params.push(`port=${port}`) };
	return new Promise((resolve, reject) => {
		console.log(hue(`tiddlywiki ${params.join(' ')}`));
		const server = spawn('tiddlywiki', params, spawnOptions);
		server.on('close', (exitcode) => {
			if (exitcode === 0) {resolve(exitcode)} else {reject(exitcode)};
		})
	})
}

// Create wiki and populate 'tiddlers' sub-directory with tiddlers from Gist
exports.twServer = function twServer(twdir, options) {
	if (options.server) {
		if (fs.existsSync(`${twdir}/tiddlywiki.info`)) {
			serverTiddlyWiki(twdir, options.port)
			.catch((exitcode) => console.error(hue(`Error code: ${exitcode}`,9)));
		} else {
			console.log(hue(`${twdir} is not a TiddlyWiki`,9));
		}
	}
}
