/*\
 * Push wiki changes to Gist
 * version: 1.0.0
 * created: 2025-07-19
 * author: PotOfCoffee2Go
 * license: MIT
\*/
const programDir = (fpath) => path.join(__dirname, '..', fpath);

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
		// trim laading/trailing quotes from commit msg unless Windows
		if (!isWin32 && params[0] === 'commit') { 
			  params[2] = params[2].slice(1, -1);
		}
		const clone = spawn(cmd, params, spawnOptions);
		clone.on('close', (exitcode) => {
			// nothing to commit - so continue
			if (params[0] === 'commit' && exitcode === 1) { exitcode = 0; }
			if (exitcode !== 0) {
				console.log(hue(`^^^ error: ${cmd} ` + params.join(' ') + ` ^^^\n`,9));
			}
			resolve(exitcode);
		})
	})
}

// Show status, add changes to commit, commit changes, push to gist
exports.twPush = function twPush(twdir, options) {
	var commitMsg = (options.message ? `"${options.message}` : '"Wiki updates') + ` (${os.hostname()})"`;
	options.dir = {
		tws: path.resolve(twdir, 'tiddlers'),
		git: findGitDir(path.resolve(twdir, 'tiddlers'))[0]
	}
	if (!fs.existsSync(options.dir.tws)) {
		options.dir.tws = path.resolve(twdir);
	}
	if (!options.dir.git) {
		console.log(hue(`Can not find .git directory`,9));
		return Promise.resolve();
	}
	spawnOptions.cwd = options.dir.git;
	return command('git', ['add', options.dir.tws])
		.then(() => command('git', ['status']))
		.then(() => command('git', ['commit', '-m', commitMsg]))
		.then(() => command('git', ['push']))
		.then(() => command('git', ['stash', 'clear']))
		.then(() => {
			if (options.log) {
				console.log();
				return command('git', options.settings.twgist_log_options);
			}
		})
		.then(() => command('git', ['status']))
		.then(() => twServer(twdir, options))
	.catch((exitcode) => console.error(hue(`Error code: ${exitcode}`,9)));
}
