module.exports = function(grunt){
	
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		casperjs:{
			options:{},
			files:
				['./test_index.js']
			
		},
		jshint:{
			options:{
			"undef": true,
     			"unused": true,
     			"jquery": true,
			"devel":true,
     			"browser": true,
     			"-W069":true,
     			"-W099":true

			},
			files:
				['../app.js']
			
		}

	
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-casperjs-plugin');
	grunt.registerTask('test_all',['jshint', 'casperjs']);
	grunt.registerTask('test',['casperjs']);
	grunt.registerTask('default',['test_all']);

};
