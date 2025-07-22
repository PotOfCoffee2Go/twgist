

const fs = require('fs-extra');
const os = require('node:os');
const path = require('node:path');
const $tw = require('tiddlywiki').TiddlyWiki();

const programDir = (fpath) => path.join(__dirname, '..', fpath);
const packageDir = (fpath) => path.join(os.homedir(), '.twgist', fpath);

exports.twConfig = function twConfig(twdir, options) {
	fs.ensureDirSync(packageDir('dbs'));

	var dir = packageDir('dbs');
	if (fs.readdirSync(dir).length === 0) {
		console.log('copy database to .twgist');
		fs.copySync(programDir('dbs'), dir);
	}
	
	$tw.boot.argv = [dir]; // TW output dir
	$tw.boot.boot(() => {
		$tw.syncer.logger.enable = false;
	});

	var settingsDb = $tw.wiki.getTiddler('twgist settings').fields;
	var settings = {
		$tw, settingsDb,
		log_option_list: $tw.utils.parseStringArray('log ' + settingsDb.log_option_list),
	}
	return settings;
}
