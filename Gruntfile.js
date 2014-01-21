module.exports = function(grunt){
require('load-grunt-tasks')(grunt);
// Time how long tasks take. Can help when optimizing build times
require('time-grunt')(grunt);

var engine = grunt.option('engine') || 'phantomjs';
grunt.initConfig({
	pkg:grunt.file.readJSON('package.json'),
	baseConfig	: {
        // configurable paths
        app:  'app',
        dist: 'dist'
    },
	casperjs:{

		options:{'engine':engine},
		files:
			['./tests/specs.*js']

	},

	useminPrepare:{
		html: ['<%= baseConfig.app %>/index.html'],

        options: {
            dest: '<%= yeoman.dist %>',
            flow:{
                steps:{
                    'js':['concat'],
                    'css':['concat','cssmin']
                },
                post:{}
            }
        }
    },
            usemin:{
                html: ['<%= baseConfig.dist %>/{,*/}*.html'],
                css: ['<%= baseConfig.dist %>/css/{,*/}*.css'],
                options: {
                    assetsDirs: ['<%= baseConfig.dist %>','<%= baseConfig.dist %>/css/images','<%= yeoman.dist %>/css/font'],
                    patterns:{
                        js:[]
                    }
                }
            },
            jshint:{
                // options:grunt.file.readJSON('package.json')['jshintConfig'],
                options:{
                    jshintrc: '.jshintrc',

                },
                all:{
                    files:
                        ['./app/app.js']
                }
            },
            rev:{
                dist: {
                files: {
                    src: [
                        '<%= baseConfig.dist %>/{,*/}*.js',
                        '<%= baseConfig.dist %>/css/{,*/}*.css',
                        '<%= baseConfig.dist %>/css/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= baseConfig.dist %>/css/font/*'
                    ]
                }
            }
            },
            connect:{
                options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729,
//                    middleware: function (connect, options) {
//                        var optBase = (typeof options.base === 'string') ? [options.base] : options.base;
//                        return [require('connect-modrewrite')(['!(\\..+)$ / [L]'])].concat(
//                            optBase.map(function (path) {
//                                return connect.static(path);
//                            }));
//                    }
                },
                livereload: {
                    options: {
                        hostname: 'local.opentaba.info',
                        open: 'http://local.opentaba.info:9000/',
                        base: [
                            '.tmp',
                            '<%= baseConfig.app %>'
                        ]
                    }
                },
                test: {
                    options: {
                        port: 9001,
                        base: [
                            '.tmp',
                            'test',
                            '<%= baseConfig.app %>'
                        ]
                    }
                },
            },

            copy:{
                dist: {
                    files: [
                        {
                            expand: true,
                            dot: true,
                            cwd: '<%= baseConfig.app %>',
                            dest: '<%= baseConfig.dist %>',
                            src: [
                                '*.{ico,png,txt}',
                                '*.html',
                                'languages/*',
                                'css/images/{,*/}*.{webp}',
                                'css/font/*'
                            ]
                        },
                        {
                            expand: true,
                            cwd: '.tmp/images',
                            dest: '<%= baseConfig.dist %>/css/images',
                            src: ['generated/*']
                        }
                    ]
                },
                styles: {
                    expand: true,
                    cwd: '<%= baseConfig.app %>/css',
                    dest: '.tmp/styles/',
                    src: '{,*/}*.css'
                }
            },
            watch:{
                js: {
                    files: [
                        '<%= baseConfig.app %>/{,*/}*.js'
                    ],
                    tasks: ['newer:jshint:all'],
                    options: {
                        livereload: true
                    }
                }

//            jsTest: {
//                files: ['tests/spec/{,*/}*.js'],
//                tasks: ['newer:jshint:test', 'karma']
//            },

                ,gruntfile: {
                    files: ['Gruntfile.js']
                },
                livereload: {
                    options: {
                        livereload: '<%= connect.options.livereload %>'
                    },
                    files: [
                        '<%= baseConfig.app %>/{,*/}*.html',
                        '.tmp/styles/{,*/}*.css',
                        '<%= baseConfig.app %>/css/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                    ]
                },

        },

            htmlmin:{
                dist: {
                    options: {
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        removeCommentsFromCDATA: true,
                        removeOptionalTags: true
                    },
                    files: [
                        {
                            expand: true,
                            cwd: '<%= baseConfig.dist %>',
                            src: ['*.html'],
                            dest: '<%= baseConfig.dist %>'
                        }
                    ]
            }
            },
            concat:{

            },


            uglify:{
                dist: {
                        options:{
                            compress:true,
                            mangle:true//@alon TODO:should set this back after I figure out how this won't break the build
                        },
                        files: {

                            '<%= yeoman.dist %>/app.js': [
                                '<%= yeoman.dist %>/app.js'
                            ]
                        }

            },
            livereload: {
                options: {
                    hostname: 'localhost',
                    open: 'http://localhost:9000/',
                    base: [
                        '.tmp',
                        '<%= baseConfig.app %>'
                    ]
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= baseConfig.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    hostname: 'localhost',
                    open:'http://localhost:9002/',
                    port: 9002,
                    base: '<%= baseConfig.dist %>'
                    }
                },

            },
            concurrent:{

            dist: [
                'imagemin',
                'svgmin'
            ]

            },
            imagemin:{
                dist: {
                        files: [
                            {
                                expand: true,
                                cwd: '<%= baseConfig.app %>/css/images',
                                src: '{,*/}*.{png,jpg,jpeg,gif}',
                                dest: '<%= baseConfig.dist %>/css/images'
                            }
                        ]
                    }
            },
            svgmin :{
                dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= baseConfig.app %>/css/images',
                        src: '{,*/}*.svg',
                        dest: '<%= baseConfig.dist %>/css/images'
                    }
                ]
                }
            },
            autoprefixer:{
                options: {
                    browsers: ['last 3 version', '> 2%']
                },
                dist: {
                    files: [
                        {
                            expand: true,
                            cwd: '.tmp/styles/',
                            src: '{,*/}*.css',
                            dest: '.tmp/styles/'
                        }
                    ]
                }

            },
            groundskeeper:{
                compile: { // if multiple files are given, this will keep the same folder structure and files
                        expand: true,
                            cwd:   '<%= baseConfig.dist%>',
                            src: ['*app.js'],
                            dest: '<%= yeoman.dist%>',
                            ext: '.js'
                    },

                    options:{

                    //                replace:"0"
                    }
        },
        clean:{
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= baseConfig.dist %>/*',
                            '!<%= baseConfig.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        }
	})



	grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['partBuild', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            //'bower-install',
//            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });
    grunt.registerTask('partBuild', [
        'clean:dist',
       // 'bower-install',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
//        'concat',
        'cssmin',
       	'groundskeeper',
        'ngmin',
        'copy:dist',
        'uglify',
        'rev',
        'usemin',
        'htmlmin',

    ]);
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-casperjs-plugin');
	grunt.registerTask('test_all',['jshint', 'casperjs']);
	grunt.registerTask('test',['casperjs']);
	grunt.registerTask('default',['test_all']);

};
