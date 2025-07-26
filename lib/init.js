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
const fs = require('fs-extra');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { twStatus } = require('./status');

const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const isWin32 = os.platform() === 'win32';

// Have git ignore $__StoryList and $__Import.tid tiddlers
const ignoreTiddlers = '\\$__StoryList*\n\\$__Import.tid\n';
 
// Spawned processes display on parent's output
const spawnOptions = { stdio: ['pipe', process.stdout, process.stderr] };
if (isWin32) { spawnOptions.shell = true; }; // Windows requires shell to be true

function turnSynclogOff(twdir, options) {
	if (!fs.existsSync(`./${twdir}/tiddlers/$__config_SyncLogging.tid`)) {
		const noSynclog = 'title: $:/config/SyncLogging\n\nno\n';
		fs.writeFileSync(`./${twdir}/tiddlers/$__config_SyncLogging.tid`, noSynclog);
		options.message = 'turn sync logging off';
		return true;
	}
	return false;
}

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

function repoStatus(twdir, options) {
	return new Promise((resolve, reject) => {
		if (options.gistid) {
			spawnOptions.cwd = `${twdir}/tiddlers`;
			console.log(hue(`cd ${twdir}/tiddlers`));
		}
		console.log(hue(`git status`));
		const status = spawn('git', ['status'], spawnOptions);
		status.on('close', (exitcode) => {
			if (options.gistid) { console.log(hue(`cd ../..`));	}
			if (exitcode === 0) {resolve(exitcode)} else {reject(exitcode)};
		})
	})
}

// Spawn commands
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

// Create wiki and populate 'tiddlers' sub-directory with tiddlers from Gist
exports.twInit = function twInit(twdir, options) {
	initTiddlyWiki(twdir)
		.then(() => {
			if (options.gistid) {
				return cloneGist(twdir, options.gistid)
					.then(() => fs.promises.writeFile(`./${twdir}/tiddlers/.git/info/exclude`, ignoreTiddlers))
					.then(() => turnSynclogOff(twdir, options))
					.then(() => repoStatus(twdir, options))
			} else {
				return fs.promises.writeFile(`./.git/info/exclude`, ignoreTiddlers)
					.then(() => fs.ensureDirSync(`./${twdir}/tiddlers`))
					.then(() => turnSynclogOff(twdir, options))
					.then(() => command('git', ['add', `${twdir}/`], spawnOptions))
					.then(() => command('git', ['status'], spawnOptions))
					.then(() => command('git', ['commit', '-m', `"Add wiki ${twdir}"`], spawnOptions))
					.then(() => repoStatus(twdir, options))
			}
		})
	.catch((exitcode) => console.error(hue(`Error code: ${exitcode}`,9)));
}
