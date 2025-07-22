#!/usr/bin/env node

const commander = require('commander');
const program = new commander.Command();

const pkg = require('./package.json');
const {twStatus} = require('./lib/status');
const {twInit} = require('./lib/init');
const {twPull} = require('./lib/pull');
const {twPush} = require('./lib/push');
const {twConfig} = require('./lib/config');

const settings = twConfig();

function myParseInt(value) {
	// parseInt takes a string and a radix
	const parsedValue = parseInt(value, 10);
	if (isNaN(parsedValue)) {
		throw new commander.InvalidArgumentError('Not a number.');
	}
	return parsedValue;
}

program
	.name('twgist')
	.description('CLI to store a TiddlyWiki in a GitHub Gist')
	.version(pkg.version);

program
	.command('status')
	.description('git status of tiddlers in wiki')
	.argument('[wiki]', 'tiddywiki server editon wiki directory', '.')
	.option('-s, --server', 'start server after command')
	.option('-p, --port <port>', 'server port', myParseInt, 8080)
	.option('-l, --log', 'display recent commits')
	.action((dir, options) => {
		options.settings = settings;
		twStatus(dir, options);
	});

program
	.command('init')
	.description('create a TiddlyWiki from a GitHub Gist.')
	.argument('<wiki>', 'directory to init a server edition wiki')
	.requiredOption('-g, --gistid  <gistid>', 'gist id that contains tiddlers')
	.action((dir, options) => {
		options.settings = settings;
		twInit(dir, options);
	});

program
	.command('pull')
	.description('Pull tiddlers from GitHub Gist')
	.argument('[wiki]', 'tiddywiki server editon wiki directory', '.')
	.option('-s, --server', 'start server after command')
	.option('-p, --port <port>', 'server port', myParseInt, 8080)
	.option('-l, --log', 'display recent commits')
	.action((dir, options) => {
		options.settings = settings;
		twPull(dir, options);
	});

program
	.command('push')
	.description('Upsteam tiddlers to GitHub Gist')
	.argument('[wiki]', 'tiddywiki server editon wiki directory', '.')
	.option('-m, --message <string>', 'commit message', 'Wiki Updates')
	.option('-s, --server', 'start server after command')
	.option('-p, --port <port>', 'server port', myParseInt, 8080)
	.option('-l, --log', 'display recent commits')
	.action((dir, options) => {
		options.settings = settings;
		twPush(dir, options);
	});

program.parse();
