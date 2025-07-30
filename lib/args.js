
const {twStat} = require('./stat');
const {twInit} = require('./init');
const {twPull} = require('./pull');
const {twPush} = require('./push');

exports.prgArgs = function prgArgs(commander, program, settings) {

function checkPort(value) {
	// parseInt takes a string and a radix
	const parsedValue = parseInt(value, 10);
	if (isNaN(parsedValue)) {
		throw new commander.InvalidArgumentError('Not a number.');
	}
	return parsedValue;
}

function checkTwdirIsRelative(value) {
	if (['/','\\'].indexOf(value[0]) > -1) {
		throw new commander.InvalidArgumentError('\nWiki directory must be a relative path');
	}
	return value;
}

program
	.command('stat')
	.description('Git status of tiddlers in wiki')
	.argument('[wiki]', 'tiddywiki server editon wiki directory', checkTwdirIsRelative, '.')
	.option('-s, --server', 'start server after command')
	.option('-p, --port <port>', 'server port', checkPort, 8080)
	.option('-l, --log', 'display recent commits')
	.action((dir, options) => {
		options.settings = settings;
		twStat(dir, options);
	});

// init command for twgist and twrepo
program
	.command('init')
	.description('Create a TiddlyWiki from a GitHub Gist.')
	.argument('<wiki>', 'directory to init a server edition wiki')
	.option('-c, --copy', 'copy wiki without git version control')
	.option('-f, --force', 'overwrite existing server edition wiki directory')
	.requiredOption('-g, --gistid  <gistid>', 'gist id that contains tiddlers')
	.action((dir, options) => {
		options.settings = settings;
		twInit(dir, options);
});

program
	.command('pull')
	.description('Pull wiki tiddlers from GitHub Gist')
	.argument('[wiki]', 'tiddywiki server editon wiki directory', '.')
	.option('-s, --server', 'start server after command')
	.option('-p, --port <port>', 'server port', checkPort, 8080)
	.option('-l, --log', 'display recent commits')
	.action((dir, options) => {
		options.settings = settings;
		twPull(dir, options);
	});

program
	.command('push')
	.description('Push wiki tiddlers to GitHub Gist')
	.argument('[wiki]', 'tiddywiki server editon wiki directory', '.')
	.requiredOption('-m, --message <string>', 'commit message')
	.option('-s, --server', 'start server after command')
	.option('-p, --port <port>', 'server port', checkPort, 8080)
	.option('-l, --log', 'display recent commits')
	.action((dir, options) => {
		options.settings = settings;
		twPush(dir, options);
	});

} // exports.prgArgs
