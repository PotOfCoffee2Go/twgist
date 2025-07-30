/*\
 * Create a 'server' edition TiddlyWiki from a Gist
 * version: 1.0.0
 * created: 2025-07-19
 * author: PotOfCoffee2Go
 * license: MIT
\*/
const fs = require('fs-extra');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { twStat } = require('./stat');
const { findGitDir } = require('./utils/findgitdir');
	
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const isWin32 = os.platform() === 'win32';

// Have git ignore $__StoryList and $__Import.tid tiddlers
const ignoreTiddlers = '\\$__StoryList*\n\\$__Import.tid\n';
 
// Spawned processes display on parent's output
const spawnOptions = { stdio: ['pipe', process.stdout, process.stderr] };
if (isWin32) { spawnOptions.shell = true; }; // Windows requires shell to be true

function turnSynclogOff(options) {
	if (!fs.existsSync(`${options.dir.tws}/tiddlers/$__config_SyncLogging.tid`)) {
		const noSynclog = 'title: $:/config/SyncLogging\n\nno\n';
		fs.writeFileSync(`${options.dir.tws}/tiddlers/$__config_SyncLogging.tid`, noSynclog);
		options.message = 'turn sync logging off';
		return true;
	}
	return false;
}

// Spawn 'tiddlywiki ${twdir} --init server' command
function initTiddlyWiki(options) {
	return new Promise((resolve, reject) => {
		console.log(hue(`tiddlywiki ${options.dir.tws} --init server`));
		const init = spawn('tiddlywiki', [options.dir.tws, '--init', 'server'], spawnOptions);
		init.on('close', (exitcode) => {
			if (exitcode === 0) {resolve(exitcode)} else {reject(exitcode)};
		})
	})
}

// Spawn 'git clone git@gist.github.com:${gist}.git ${twdir}/tiddlers' command
function cloneGist(options) {
	return new Promise((resolve, reject) => {
		console.log(hue(`git clone git@gist.github.com:${options.gistid}.git ${options.dir.tws}/tiddlers`));
		const clone = spawn('git',
			['clone', `git@gist.github.com:${options.gistid}.git`, `${options.dir.tws}/tiddlers`], spawnOptions);
		clone.on('close', (exitcode) => {
			if (exitcode === 0) {resolve(exitcode)} else {reject(exitcode)};
		})
	})
}

// Spawn commands
function command(cmd, params=[], options) {
	return new Promise((resolve, reject) => {
		spawnOptions.cwd = options.dir.tws;
		console.log(hue(`${cmd} ` + params.join(' ')));
		// trim laading/trailing quotes from commit msg unless Windows
		if (!isWin32 && params[0] === 'commit') { 
			  params[2] = params[2].slice(1, -1);
		}
		const init = spawn(cmd, params, spawnOptions);
		// Always continue to next command
		init.on('close', (exitcode) => { resolve(0); });
	})
}

function createWiki(twdir, options) {
	return initTiddlyWiki(options)
		.then(() => { if (options.dir.git && !options.copy) {
			console.log(hue(`# cloning ${twdir} to existing repository: ${options.dir.git}`,171));
		}})
		.then(() => cloneGist(options))
		.then(() => { if (options.dir.git || options.copy) {
			console.log(hue(`# removed .git directory from ${options.dir.tws}/tiddlers`,171));
			return fs.promises.rm(`${options.dir.tws}/tiddlers/.git`, { recursive: true, force: true });
		}})
		.then (() => { // find to current .git directory
			options.dir.git = findGitDir(`${options.dir.tws}/tiddlers`)[0];
			return Promise.resolve();
		})
		.then(() => turnSynclogOff(options))
		.then (() => {
			if (!options.copy) {
				return fs.promises.writeFile(`${options.dir.git}/.git/info/exclude`, ignoreTiddlers)
				.then(() => command('git', ['add', `${options.dir.tws}/`], options))
				.then(() => twStat(twdir,options))
				.then(() => console.log(hue(`# To commit and push\n# twgist push -l -m "Add wiki ${twdir}"`,171)))
			}
		})
	.catch((exitcode) => console.error(hue(`Error code: ${exitcode}`,9)));
}

// Create wiki and populate 'tiddlers' sub-directory with tiddlers from Gist
exports.twInit = function twInit(twdir, options) {
	// Cloning into an existing repo
	options.dir = {
		tws: path.resolve(twdir),
		git: findGitDir(path.resolve(twdir))[0]
	}
	if (options.force && fs.existsSync(options.dir.tws)) {
		fs.removeSync(options.dir.tws);
		console.log(hue(`# removed wiki ${options.dir.tws}`,171))
	}
	return createWiki(twdir, options);
}
