/*\
 * Get settings from .twgist/dbs TiddlyWiki
 * version: 1.0.0
 * created: 2025-07-19
 * author: PotOfCoffee2Go
 * license: MIT
\*/

const fs = require('fs-extra');
const os = require('node:os');
const path = require('node:path');
const $tw = require('tiddlywiki').TiddlyWiki();

const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;

const programDir = (fpath) => path.join(__dirname, '..', fpath);
const packageDir = (fpath) => path.join(os.homedir(), '.twgist', fpath);

exports.twConfig = function twConfig(programName) {
	var dir = packageDir('dbs');
	fs.ensureDirSync(dir);

	if (fs.readdirSync(dir).length === 0) {
		console.log(hue('Copying default twgist app wiki to ~/.twgist/dbs',193));
		fs.copySync(programDir('dbs'), dir);
		console.log(hue(
`-------------------------------------------------
tiddlywiki ~/.twgist/dbs --listen port=9090

Go to http//:localhost:9090 to open twgist's wiki
-------------------------------------------------`
		, 123));
	}

	$tw.boot.argv = [dir]; // TW output dir
	$tw.boot.boot(() => {
		$tw.syncer.logger.enable = false;
	});

	var settingsDb = $tw.wiki.getTiddler('twgist settings').fields;
	var settings = {
		name: programName,
		twgist_log_options: $tw.utils.parseStringArray('log ' + settingsDb.twgist_log_options),
		$tw, settingsDb
 	}
	return settings;
}
