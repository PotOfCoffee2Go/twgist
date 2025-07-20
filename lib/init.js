/*\
 * Create a 'server' edition TiddlyWiki from a Gist
 * 
 * usage: twgist init wikiDirectory -g gistId
 * 
 * version: 1.0.0
 * created: 2025-07-19
 * author: PotOfCoffee2Go
 * license: MIT
\*/
const fs = require('node:fs');
const os = require('node:os');
const { spawn } = require('node:child_process');

const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const isWin32 = os.platform() === 'win32';

// Have git ignore $__StoryList and $__Import.tid tiddlers
const ignoreTiddlers = '\\$__StoryList*\n\\$__Import.tid\n';

// Spawned processes display on parent's output
const spawnOptions = { stdio: ['pipe', process.stdout, process.stderr] };
if (isWin32) { spawnoptions.shell = true; }; // Windows requires shell to be true

// Spawn 'tiddlywiki ${twdir} --init server' command
function initTiddlyWiki(twdir) {
	return new Promise((resolve, reject) => {
		console.log(hue(`tiddlywiki ${twdir} --init server`));
		const init = spawn('tiddlywiki', [twdir, '--init', 'server'], spawnOptions);
		init.on('close', (exitcode) => {
			if (exitcode === 0) {resolve(exitcode)} else {reject(exitcode)};
		})
	})
}

// Spawn 'git clone git@gist.github.com:${gist}.git ${twdir}/tiddlers' command
function cloneGist(twdir, gist) {
	return new Promise((resolve, reject) => {
		console.log(hue(`git clone git@gist.github.com:${gist}.git ${twdir}/tiddlers`));
		const clone = spawn('git',
			['clone', `git@gist.github.com:${gist}.git`, `${twdir}/tiddlers`], spawnOptions);
		clone.on('close', (exitcode) => {
			if (exitcode === 0) {resolve(exitcode)} else {reject(exitcode)};
		})
	})
}

// Create wiki and populate 'tiddlers' sub-directory with tiddlers from Gist
exports.twInit = function twInit(twdir, gist) {
	initTiddlyWiki(twdir)
		.then(() => cloneGist(twdir, gist))
		.then(() => fs.writeFileSync(`./${twdir}/tiddlers/.git/info/exclude`, ignoreTiddlers))
		.then(() => console.log(`\nTo start the WebServer: ` + hue(`tiddlywiki ${twdir} --listen`,10)))
	.catch((exitcode) => console.error(hue(`Error code: ${exitcode}`,9)));
}
