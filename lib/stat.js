/*\
 * Status of local files (tiddlers)
 * version: 1.0.0
 * created: 2025-07-19
 * author: PotOfCoffee2Go
 * license: MIT
\*/

const fs = require('fs-extra');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { twServer } = require('./server');
const { findGitDir } = require('./utils/findgitdir');

const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const isWin32 = os.platform() === 'win32';
const pathsep = isWin32 ? '\\' : '/';
const pathup = (twdir) => twdir === '.' ? '..' : `..${pathsep}..`;

// Spawned processes display on parent's output
const spawnOptions = { stdio: ['pipe', process.stdout, process.stderr] };
if (isWin32) { spawnOptions.shell = true; }; // Windows requires shell to be true

// Spawn commands
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
exports.twStat = function twStat(twdir, options) {
	options.dir = {
		tws: path.resolve(twdir),
		git: findGitDir(path.resolve(twdir, 'tiddlers'))[0]
	}
	if (!options.dir.git) {
		console.log(hue(`Can not find .git directory`,9));
		return Promise.resolve();
	}
	spawnOptions.cwd = options.dir.git;

	return command('git', ['status'])
		.then(() => {
			if (options.log) {
				console.log();
				return command('git', options.settings.twgist_log_options);
			}
		})
		.then(() => twServer(twdir, options))
	.catch((exitcode) => console.error(hue(`Error code: ${exitcode}`,9)));
}
