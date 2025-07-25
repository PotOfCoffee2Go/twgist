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
		// trim laading/trailing quotes from commit msg unless Windows
		if (!isWin32 && params[0] === 'commit') { 
			  params[2] = params[2].slice(1, -1);
		}
		const pull = spawn(cmd, params, spawnOptions);
		// Always continue to next command
		pull.on('close', (exitcode) => { resolve(0); });
	})
}

// Show status, add changes to commit, commit changes, push to gist
exports.twPull = function twPull(twdir, options) {
	var commitMsg = (options.message ? `"${options.message}` : '"Wiki updates') + ` (${os.hostname()})"`;
	spawnOptions = { cwd: `${twdir}/tiddlers`, stdio: ['pipe', process.stdout, process.stderr] };
	if (isWin32) { spawnOptions.shell = true; }; // Windows requires shell to be true

	console.log(hue(`cd ${twdir}${pathsep}tiddlers\n`));
	if (fs.existsSync(`${twdir}/tiddlywiki.info`)) {
		command('git', ['stash'])
			.then(() => command('git', ['pull']))
			.then(() => command('git', ['stash', 'pop', '--index']))
			.then(() => {
				if (options.log) {
					console.log();
					return command('git', options.settings.twgist_log_options);
				}
			})
			.then(() => console.log(hue(`\ncd ${pathup(twdir)}`)))
			.then(() => twServer(twdir, options))
		.catch((exitcode) => console.error(hue(`Error code: ${exitcode}`,9)));
	}
}
