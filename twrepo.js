#!/usr/bin/env node

const commander = require('commander');
const program = new commander.Command();

const pkg = require('./package.json');
const {twConfig} = require('./lib/config');
const {prgArgs} = require('./lib/args');

program
	.name('twrepo')
	.description('CLI to store TiddlyWikis to GitHub Repos')
	.version(pkg.version);

const settings = twConfig(program.name());

prgArgs(commander, program, settings);

program.parse();
