/*\
 * Pull Gist changes to wiki
 * 
 * usage: twgist status wikiDirectory
 * 
 * version: 1.0.0
 * created: 2025-07-19
 * author: PotOfCoffee2Go
 * license: MIT
\*/

const fs = require('fs-extra');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { twServer } = require('./server');

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

// Show status
exports.twStatus = function twStatus(twdir, options) {
	spawnOptions = { cwd: `${twdir}/tiddlers`, stdio: ['pipe', process.stdout, process.stderr] };
	if (isWin32) { spawnOptions.shell = true; }; // Windows requires shell to be true

	console.log(hue(`cd ${twdir}${pathsep}tiddlers\n`));
	if (fs.existsSync(`${twdir}/tiddlywiki.info`)) {
		command('git', ['status'])
			.then(() => {
				if (options.log) {
					console.log();
					return command('git', ['log', '--oneline', '--graph', '--decorate', '-n 5']);
				}
			})
			.then(() => console.log(hue(`\ncd ${pathup(twdir)}`)))
			.then(() => twServer(twdir, options))
		.catch((exitcode) => console.error(hue(`Error code: ${exitcode}`,9)));
	} else {
		console.log(hue(`${twdir} is not a TiddlyWiki`,9));
	}
}
