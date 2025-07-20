#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

const pkg = require('./package.json');
const {twStatus} = require('./lib/status');
const {twInit} = require('./lib/init');
const {twPull} = require('./lib/pull');
const {twPush} = require('./lib/push');

program
	.name('twgist')
	.description('CLI to store a TiddlyWiki in a GitHub Gist')
	.version(pkg.version);

program
	.command('status')
	.description('git status of tiddlers in wiki')
	.argument('[wiki]', 'TiddlyWiki directory to display status', '.')
	.action((dir, options) => {
		twStatus(dir);
	});

program
	.command('init')
	.description('create a TiddlyWiki from a GitHub Gist.')
	.argument('<wiki>', 'directory to init a server edition wiki')
	.requiredOption('-g, --gistid  <gistid>', 'gist id that contains tiddlers')
	.action((dir, options) => {
		twInit(dir, options.gistid);
	});

program
	.command('pull')
	.description('Pull tiddlers from GitHub Gist')
	.argument('[wiki]', 'TiddlyWiki directory to pull tiddlers into', '.')
	.action((dir, options) => {
		twPull(dir);
	});

program
	.command('push')
	.description('Upsteam tiddlers to GitHub Gist')
	.argument('[wiki]', 'TiddlyWiki directory to push', '.')
	.option('-m, --message <string>', 'commit message', 'Wiki Updates')
	.action((dir, options) => {
		twPush(dir, options.message);
	});

program.parse();
