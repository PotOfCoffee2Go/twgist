const { createInterface } = require('node:readline');
const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: 'twgist > ',
});

exports.prompt = function prompt(twdir, options) {
	return new Promise((resolve, reject) => {
		rl.prompt();
		process.stdout.write(options.question);
		rl.on('line', (line) => {
			switch (line.trim()) {
			case 'hello':
				console.log('world!');
				break;
			default:
				console.log(`Say what? I might have heard '${line.trim()}'`);
				break;
			}
			rl.prompt();
		}).on('close', () => {
			console.log('Have a great day!');
			resolve();
		});
	})
}
