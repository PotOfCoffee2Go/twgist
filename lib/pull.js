/*\
 * Pull Gist changes to wiki
 * 
 * usage: twgist pull wikiDirectory
 * 
 * version: 1.0.0
 * created: 2025-07-19
 * author: PotOfCoffee2Go
 * license: MIT
\*/

const os = require('node:os');
const { spawn } = require('node:child_process');

const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const isWin32 = os.platform() === 'win32';
const pathsep = isWin32 ? '\\' : '/';
const pathup = (twdir) => twdir === '.' ? '..' : `..${pathsep}..`;

// Spawn commands
var spawnOptions;
function command(cmd, params=[]) {
	return new Promise((resolve, reject) => {
		console.log(hue(`${cmd} ` + params.join(' ')));
		const pull = spawn(cmd, params, spawnOptions);
		pull.on('close', (exitcode) => {
			if (exitcode === 0) {resolve(exitcode)} else {reject(exitcode)};
		})
	})
}

// Show status, add changes to commit, commit changes, push to gist
exports.twPull = function twPull(twdir) {
	spawnOptions = { cwd: `${twdir}/tiddlers`, stdio: ['pipe', process.stdout, process.stderr] };
	if (isWin32) { spawnOptions.shell = true; }; // Windows requires shell to be true

	console.log(hue(`cd ${twdir}${pathsep}tiddlers`));
	command('git', ['status'])
		.then(() => command('git', ['pull']))
		.then(() => console.log(`\nWebServer will need to be restarted unless 'Already up to date'` +
			'\nCommand is: ' + hue(`tiddlywiki ${twdir} --listen`,10)))
		.then(() => console.log(hue(`cd ${pathup(twdir)}`)))
	.catch((exitcode) => console.error(hue(`Error code: ${exitcode}`,9)));
}
