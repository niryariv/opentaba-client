module.exports = function(grunt){
	var engine = grunt.option('engine') || 'phantomjs';
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		casperjs:{
			options:{'engine':engine},
			files:
				['./test_index.js',
				'./test_map_regression.js',
				'./test_index_get_gush.js'] //TODO: Add the other testing files when ready
			
		},
		jshint:{
			options:grunt.file.readJSON('package.json')['jshintConfig'],
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
