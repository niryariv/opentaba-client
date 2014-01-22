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
			['./tests/specs/*.js']

	},

	useminPrepare:{
		html: ['<%= baseConfig.app %>/index.html'],

        options: {
            dest: '<%= baseConfig.dist %>',
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
                    assetsDirs: ['<%= baseConfig.dist %>','<%= baseConfig.dist %>/css/images','<%= baseConfig.dist %>/css/font'],
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
                dist:{
                    options: {
                        port: 9002,
                        open: 'http://local.opentaba.info:9002/',

                        base: [
                            '.tmp',
                            '<%= baseConfig.dist %>'
                        ]
                    }
                }
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
                                'data/**.*.js',
                                'css/images/{,*/}*.{webp}',
                                'css/font/*',
                                'CNAME'
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
                    dest: '.tmp/css/',
                    src: '{,*/}*.css'
                },
                static:{
                    files :[
                        {
                            expand:true,
                            dot:true,
                            flatten:true,
                            cwd:'<%= baseConfig.app %>',
                            dest: '<%= baseConfig.dist %>/font',
                            src:['lib/font-awesome/font/*']
                        }
                    ]
                }
            },
            'gh-pages':{
                options:{
                    base:'<%= baseConfig.dist %>'
                },
                src:['**/*']
            },
            watch:{
                js: {
                    files: [
                        '<%= baseConfig.app %>/{,*/}*.js',
                        '<%= baseConfig.app %>/**/{,*/}*.js'
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
                        '.tmp/css/{,*/}*.css',
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

            uglify:{
                dist: {
                        options:{
                            compress:true,
                            mangle:true//@alon TODO:should set this back after I figure out how this won't break the build
                        },
                        files: {

                            '<%= baseConfig.dist %>/app.js': [
                                '<%= baseConfig.dist %>/app.js'
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
                            cwd: '.tmp/css/',
                            src: '{,*/}*.css',
                            dest: '.tmp/css/'
                        }
                    ]
                }

            },
            groundskeeper:{
                compile: { // if multiple files are given, this will keep the same folder structure and files
                        expand: true,
                            cwd:   '<%= baseConfig.dist%>',
                            src: ['app.js'],
                            dest: '<%= baseConfig.dist%>',
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
        'clean:dist', //clean the dist folder
       // 'bower-install',
        'useminPrepare',
        'concurrent:dist', //image minification inside this task
        'autoprefixer', //prefix css for different browsers
        'concat', //concats css files and js files together according to usemin block in index.html
        'cssmin', //css minifier
       	'groundskeeper', //remove console.log remarks
        'copy:dist', // copy some dependency and images
        'uglify', //compress and mangle our scripts
        'rev', //changes file name to disable browser caching
        'usemin', //execute the final stage of useminPrepare
        'htmlmin', // minify html
        'copy:static' //copies unrevvyed dependency (font-awesome) until we figure how to rev them too

    ]);
	grunt.registerTask('test_all',['jshint', 'casperjs']);
	grunt.registerTask('test',['casperjs']);
	grunt.registerTask('default',['test_all']);
    grunt.registerTask('build',['partBuild', 'gh-pages']); // run the build + pushes to gh-pages

};
