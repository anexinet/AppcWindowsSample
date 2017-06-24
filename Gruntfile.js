var child_process = require('child_process');

module.exports = function (grunt) {

	// Configure the plugins
	grunt.initConfig({
		options: {
			appccli: 'appc',
			runCommand: 'run',
			compileFlags: '-b',
			platformSwitch: '-p',
			platformios: 'ios',
			platformAndroid: 'android',
			loglevelFlag: '--log-level',
			loglevelDebug: 'debug',
			buildTarget: 'dist-adhoc',
			profileId: '1f87f869-f11c-48f4-b191-ad7d1a6b8449',
			outputDir: './build',
			developerName: 'Propelics, Inc.',
			simulatorTimeout: 600,
			targetFlag: '-T',
			targetValueios: 'simulator',
			targetValueAndroid: 'emulator',
			simType: '-Y',
			simValue: 'ipad',
			simVersionFlag: '-S',
			simVersion: '9.3',
			minorIndexVersion: 1
		},
		loginOptions: {
			username: grunt.option('username'),
			password: grunt.option('password'),
			orgId: grunt.option('orgID')
		},
		jsbeautifier: {
			// ,'app/styles/login/loginWindow.tss' TODO: Beautify TSS files
			files: [
				'.jsbeautifyrc',
				'.jscsrc',
				'.jshintrc',
				'tiapp.xml',
				'Gruntfile.js',
				'app/controllers/**/*.js',
				'app/models/*.js',
				'app/lib/**/*.js',
				'app/views/**/*.xml',
				'app/styles/**/*.tss',
				'app/i18n/**/*.xml',
				'app/alloy.js'
			],
			options: {
				config: '.jsbeautifyrc'
			}
		},
		xml_validator: {
			src: ['tiapp.xml', 'app/views/**/*.xml', 'app/i18n/**/*.xml']
		},
		jshint: {
			all: {
				src: [
					'Gruntfile.js',
					'app/controllers/**/*.js',
					'app/models/*.js',
					'app/lib/**/*.js',
					'app/alloy.js'
				]
			},
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			}
		},
		jscs: {
			options: {
				config: '.jscsrc'
			},
			all: {
				src: [
					'Gruntfile.js',
					'app/controllers/**/*.js',
					'app/models/*.js',
					'app/lib/**/*.js',
					'app/alloy.js'
				]
			}
		},
		jsduck: {
			options: {
				config: 'docs/jsduck.json'
			},
			all: {
				src: [
					'app/controllers/**/*.js',
					'app/models/*.js',
					'app/lib/**/*.js',
					'app/alloy.js'
				]
			}
		}
	});

	// Appcelerator Login
	grunt.registerTask('login', 'AppC Login', function (username, password, orgId) {
		var options = grunt.config('options');
		var loginOptions = grunt.config('loginOptions');
		console.log('login username ' + loginOptions.username);

		var loginUsername = username;
		var loginPassword = password;
		var loginOrgId = orgId;

		if (loginUsername == null) {
			loginUsername = loginOptions.username;
		}
		if (loginPassword == null) {
			loginPassword = loginOptions.password;
		}
		if (loginOrgId == null) {
			loginOrgId = loginOptions.orgId;
		}

		console.log('login username ' + loginUsername);
		grunt.util.spawn({
			cmd: options.appccli,
			args: ['login',
				'--username', loginUsername,
				'--password', loginPassword,
				'--org-id', loginOrgId
			],
			opts: {
				stdio: 'inherit',
				nospawn: 'true'
			}
		}, grunt.task.current.async());
	});

	// Build Project iOS
	grunt.registerTask('buildiOS', 'Execute Appc iOS build', function () {
		var options = grunt.config('options');
		grunt.util.spawn({
			cmd: options.appccli,
			args: [options.runCommand, options.compileFlags, options.platformSwitch, options.platformios],
			opts: {
				stdio: 'inherit',
				nospawn: 'true'
			}
		}, grunt.task.current.async());
	});

	// Build Project Android
	grunt.registerTask('buildAndroid', 'Execute Appc Android build', function () {
		var options = grunt.config('options');
		grunt.util.spawn({
			cmd: options.appccli,
			args: [options.runCommand, options.compileFlags, options.platformSwitch, options.platformAndroid],
			opts: {
				stdio: 'inherit',
				nospawn: 'true'
			}
		}, grunt.task.current.async());
	});

	//Build IPA
	grunt.registerTask('buildipa', 'Build IPA', function () {
		var options = grunt.config('options');
		grunt.util.spawn({
			cmd: options.appccli,
			args: [options.runCommand, options.compileFlags, options.platformSwitch, options.platformios,
				'--log-level', 'debug',
				'--target', options.buildTarget,
				'--pp-uuid', options.profileId,
				'--output-dir', options.outputDir,
				'--distribution-name', options.developerName,
			],
			opts: {
				stdio: 'inherit',
				nospawn: 'true'
			}
		}, grunt.task.current.async());
	});

	//Build APK
	grunt.registerTask('buildapk', 'Build APK', function () {
		var options = grunt.config('options');
		grunt.util.spawn({
			cmd: options.appccli,
			args: [options.runCommand, options.compileFlags, options.platformSwitch, options.platformAndroid,
				'--log-level', 'debug',
				'--target', options.targetValueAndroid,
				'--output-dir', options.outputDir,
				'--distribution-name', options.developerName,
			],
			opts: {
				stdio: 'inherit',
				nospawn: 'true'
			}
		}, grunt.task.current.async());
	});

	// Run test cases
	grunt.registerTask('test', 'Run tests', function (timeout) {

		var options = grunt.config('options');
		var done = this.async();
		var child = grunt.util.spawn({
			cmd: options.appccli,
			args: [options.runCommand, options.platformSwitch, options.platformios, options.loglevelFlag, options.loglevelDebug,
				options.targetFlag, options.targetValueios, options.simType, options.simValue, options.simVersionFlag,
				options.simVersion
			],
			opts: {
				stdio: 'inherit',
				nospawn: 'true'
			}
		}, function () {
			console.log('done test');
			done();
		});

		// Kill iOS Simulator after a timeout
		var simulatorTimeout = timeout;
		if (simulatorTimeout == null) {
			simulatorTimeout = options.simulatorTimeout;
		}
		setTimeout(function () {
			console.log('work done. pid = ' + child.pid);
			//grunt.util.spawn({cmd: 'killall', args: ['iOS Simulator'], opts: {stdio: 'inherit'}}, function() {done()});
			done();
		}, simulatorTimeout * 1000);

	});

	grunt.registerTask('kill-sim', 'Kills ios simulator', function () {

		//var options = grunt.config('options');
		var done = this.async();
		grunt.util.spawn({
			cmd: 'killall',
			args: ['iOS Simulator'],
			opts: {
				stdio: 'inherit'
			}
		}, function () {
			done();
		});
		done();
	});

	grunt.registerTask('versionBump', 'Performs a version bump on the tiapp.xml file', function () {
		var tiapp = require('tiapp.xml').load('./tiapp.xml');
		var versionSplitted = tiapp.version.split('.');
		var options = grunt.config('options');

		versionSplitted[options.minorIndexVersion] = parseInt(versionSplitted[options.minorIndexVersion], 10) || 0;
		versionSplitted[options.minorIndexVersion]++;

		tiapp.version = versionSplitted.join('.');
		tiapp.write();

		grunt.log.writeln('New App Version: ' + tiapp.version);
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jsbeautifier');
	grunt.loadNpmTasks('grunt-xml-validator');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-jsduck');

	grunt.registerTask('default', [
		'jsbeautifier',
		'xml_validator',
		'jshint:all',
		// 'jscs:all'
		'jsduck:all'
	]);

	grunt.registerTask('jenkins', [
		'default',
		'versionBump',
		'jsbeautifier'
	]);

	grunt.registerTask('iOSBuild', [
		'login',
		'buildiOS',
		'buildipa'
	]);

	grunt.registerTask('AndroidBuild', [
		'login',
		'buildAndroid',
		'buildapk'
	]);

	grunt.registerTask('buildtest', [
		'login',
		'buildiOS',
		'test:120',
		'kill-sim'
	]);
};
