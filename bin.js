#!/usr/bin/env node
const fork = require('util').promisify(
	require('child_process').fork
);
const os = require('os');
const sade = require('sade');
const parse = require('./parse');
const pkg = require('./package');

sade('uvu [dir] [pattern]')
	.version(pkg.version)
	.option('-b, --bail', 'Exit on first failure')
	.option('-i, --ignore', 'Any file patterns to ignore')
	.option('-r, --require', 'Additional module(s) to preload')
	.option('-C, --cwd', 'The current directory to resolve from', '.')
	.option('-c, --color', 'Print colorized output', true)
	.option('-p, --parallel', 'Runs suites in parallel', 1)
	.action(async (dir, pattern, opts) => {
		if (opts.color) process.env.FORCE_COLOR = '1';
		if (opts.parallel > 1) {
			opts.parallel = Math.max(ops.parallel, os.cpus().length)
		}
		let { suites } = await parse(dir, pattern, opts);
		let { writeResults } = require('.');

		let result = {
			total: 0,
			code: 0,
			done: 0,
			skips: 0,
			duration: 0
		}

		// TODO: split suites in opts.parallel parts and fork n times
		await fork(__dirname + '/cli-run', [JSON.stringify(suites)])
			.then(({ stdout }) => {
				const {
					total,
					code,
					done,
					skips,
					duration
				} = JSON.parse(stdout)

				result.total += total
				result.code = result.code || code
				result.done += done
				result.skips += skips
				duration += duration
			})

		writeResults(result)
	})
	.parse(process.argv);
