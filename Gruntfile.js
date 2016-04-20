'use strict';

module.exports = function(grunt) {
    // Show elapsed time after tasks run
    require('time-grunt')(grunt);
    // Load all Grunt tasks
    require('jit-grunt')(grunt);
    require('load-grunt-tasks')(grunt); 

    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    var lib = require('bower-files')();

    grunt.initConfig({
        app: {
            source: 'app',
            dist: 'dist',
            baseurl: ''
        },
        watch: {
            sass: {
                files: ['<%= app.source %>/_assets/scss/**/*.{scss,sass}'],
                tasks: ['sass:server', 'autoprefixer']
            },
            scripts: {
                files: ['<%= app.source %>/_assets/js/**/*.js'],
                tasks: ['uglify:server']
            },
            data: {
                files: ['<%= app.source %>/_assets/data/**/*.{json}'],
                tasks: ['copy:server']
            },
            php: {
                files: ['<%= app.source %>/_assets/php/**/*.{php}'],
                tasks: ['copy:server']
            },
            jekyll: {
                files: ['<%= app.source %>/**/*.{html,yml,md,mkd,markdown,js}'],
                tasks: ['jekyll:server']
            },
            images: {
                files: ['<%= app.source %>/img/**/*.{gif,jpg,jpeg,png,svg,webp}'],
                tasks: ['copy:server']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '.jekyll/**/*.{html,yml,md,mkd,markdown}',
                    '.tmp/<%= app.baseurl %>/css/*.css',
                    '.tmp/<%= app.baseurl %>/js/*.js',
                    '.tmp/<%= app.baseurl %>/assets/php/*.php',
                    '.tmp/<%= app.baseurl %>/assets/data/*.json',
                    '.tmp/<%= app.baseurl %>/img/**/*.{gif,jpg,jpeg,png,svg,webp}'
                ]
            }
        },
        php: {
            dist: {
                options: {
                    port: 5000,
                    keepalive: true,
                    open: true,
                    base: 'dist'
                }
            }
        },
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: {
                        target: 'http://localhost:9000/<%= app.baseurl %>'
                    },
                    base: [
                        '.jekyll',
                        '.tmp',
                        '<%= app.source %>'
                    ]
                }
            },
            dist: {
                options: {
                    open: {
                        target: 'http://localhost:9000/<%= app.baseurl %>'
                    },
                    base: [
                        '<%= app.dist %>',
                        '.tmp'
                    ]
                }
            }
        },
        clean: {
            server: [
                '.jekyll',
                '.tmp'
            ],
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= app.dist %>/*',
                        '!<%= app.dist %>/.git*'
                    ]
                }]
            }
        },
        jekyll: {
            options: {
                config: '_config.yml,_config.build.yml',
                src: '<%= app.source %>'
            },
            dist: {
                options: {
                    dest: '<%= app.dist %>/<%= app.baseurl %>',
                }
            },
            server: {
                options: {
                    config: '_config.yml',
                    dest: '.jekyll/<%= app.baseurl %>'
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                    minifyJS: true,
                    minifyCSS: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>',
                    src: '**/*.html',
                    dest: '<%= app.dist %>/<%= app.baseurl %>'
                }]
            }
        },
        bowercopy: {
          options: {
            srcPrefix: 'bower_components'
          },
            main: {
                src: 'bower_components',
                dest: '.tmp/<%= app.baseurl %>/bower_components'
            }
        },
            rev: {
            dist: {
                files: {
                    src: [
                        '<%= app.dist %>/js/**/*.js',
                        '<%= app.dist %>/css/**/*.css',
                        // '<%= app.dist %>/assets/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        /*'<%= app.dist %>/assets/fonts/*',*/
                    ]
                }
            }
        },
        useminPrepare: {
          html: '<%= app.source %>/_includes/**/*.html',
          js: ['<%= app.distribute %>/js/vendor.js'],
            options: {
                dest: '<%= app.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglify'],
                            css: ['cssmin'] // Let cssmin concat files so it corrects relative paths to fonts and images
                        },
                        post: {}
                    }
                }
            }
        },
        usemin: {
          html: '<%= app.dist %>/**/*.html',
          js: ['<%= app.dist %>/js/vendor.js'],
          options: {
                assetsDirs: ['<%= app.dist %>'],
                patterns: {
                    js: [
                        [/(img\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
                    ]
                },
                dirs: ['<%= app.dist %>']
            }

        },
        uglify: {
            server: {
                options: {
                    mangle: false,
                    beautify: true
                },
                files: {
                    '.tmp/<%= app.baseurl %>/js/scripts.js': ['<%= app.source %>/_assets/js/**/*.js']
                }
            },
            dist: {
                options: {
                    mangle: false,
                    compress: true,
                    preserveComments: false,
                },
                files: {
                    '<%= app.dist %>/<%= app.baseurl %>/js/scripts.js': ['<%= app.source %>/_assets/js/**/*.js'],
                    '<%= app.dist %>/js/vendor.min.js': ['<%= app.dist %>/js/vendor.min.js'],
                }
            }
        },
        bowerInstall: {
         
          target: {
         
            // Point to the files that should be updated when 
            // you run `grunt bower-install` 
            src: [
              'app/**/*.html',   // .html support... 
              'app/**/*.js',   // .jade support... 
              'app/main.scss',  // .scss & .sass support... 
            ],
         
            // Optional: 
            // --------- 
            cwd: '',
            dependencies: true,
            devDependencies: false,
            exclude: [],
            fileTypes: {},
            ignorePath: '',
            overrides: {}
          }
        },
        wiredep: {
          target: {
            src: 'app/**/*.html' // point to your HTML file.
          }
        },
        bower_concat: {
          all: {
            dest: {
              'js': '<%= app.dist %>/js/vendor.min.js',
              // 'css': '<%= app.dist %>/css/vendor.css'c
            },
            exclude: ['flexboxgrid','bootstrap','jasny-bootstrap'],
            dependencies: {
            },
            bowerOptions: {
              relative: false
            }
          }
        },
        sass: {
            options: {
                includePaths: ['bower_components/bootstrap-sass/assets/stylesheets']
            },
            server: {
                options: {
                    sourceMap: true,
                    loadPath: 'bower_components'
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.source %>/_assets/scss',
                    src: '**/*.{scss,sass}',
                    dest: '.tmp/<%= app.baseurl %>/css',
                    ext: '.min.css'
                }]
            },
            dist: {
                options: {
                    outputStyle: 'compressed'
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.source %>/_assets/scss',
                    src: '**/*.{scss,sass}',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/css',
                    ext: '.min.css'
                }]
            }
        },
        uncss: {
            options: {
                htmlroot: '<%= app.dist %>/<%= app.baseurl %>',
                report: 'gzip'
            },
            dist: {
                src: '<%= app.dist %>/<%= app.baseurl %>/**/*.html',
                dest: '<%= app.dist %>/<%= app.baseurl %>/css/blog.css'
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 3 versions']
            },
            server: {
                files: [{
                    expand: true,
                    cwd: '.tmp/<%= app.baseurl %>/css',
                    src: '**/*.css',
                    dest: '.tmp/<%= app.baseurl %>/css'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/css',
                    src: '**/*.css',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/css'
                }]
            }
        },
        critical: {
            dist: {
                options: {
                    base: './',
                    css: [
                        '<%= app.dist %>/<%= app.baseurl %>/css/blog.css'
                    ],
                    minify: true,
                    width: 320,
                    height: 480
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>',
                    src: ['**/*.html'],
                    dest: '<%= app.dist %>/<%= app.baseurl %>'
                }]
            }
        },
        cssmin: {
            dist: {
                options: {
                    keepSpecialComments: 0,
                    check: 'gzip'
                },
                files: [{
                    expand: true,
                    // expand: false,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/css',
                    src: ['*.css', '!*.min.css'],
                    dest: '<%= app.dist %>/<%= app.baseurl %>/css',
                    ext: '.min.css'
                }]
            }
        },
        imagemin: {
            options: {
                progressive: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/img',
                    src: '**/*.{jpg,jpeg,png,gif}',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/img'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/img',
                    src: '**/*.svg',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/img'
                }]
            }
        },
        copy: {
            server: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= app.source %>',
                    src: ['img/**/*'],
                    dest: '.tmp/<%= app.baseurl %>'
                },{
                    expand: true,
                    cwd: '<%= app.source %>/_assets',
                    src: ['data/**/*.json'],
                    dest:'.tmp/<%= app.baseurl %>/assets'
                },{
                    expand: true,
                    cwd: '<%= app.source %>/_assets',
                    src: ['php/**/*.php'],
                    dest:'.tmp/'
                }
                // ,{
                //     'expand': true,
                //     'cwd': '<%= app.source %>/_assets',
                //     'src': 'data/**/*.json',
                //     'dest': '.tmp/<%= app.baseurl %>'
                // }
                ]
            },
            build:{
                files: [{
                    expand: true,
                    cwd: '<%= app.source %>/_assets/data/',
                    src: ['*.json'],
                    dest:'<%= app.dist %>/assets/data/'
                },{
                    expand: true,
                    cwd: '<%= app.source %>/_assets/php/',
                    src: ['*.php'],
                    dest:'<%= app.dist %>/'
                },{
                    expand: true,
                    cwd: '<%= app.source %>/_assets/html',
                    src: ['*.html'],
                    dest:'<%= app.dist %>/'
                }]
            }   
        },
        buildcontrol: {
            dist: {
                options: {
                    dir: '<%= app.dist %>/<%= app.baseurl %>',
                    remote: 'git@github.com:user/repo.git',
                    branch: 'gh-pages',
                    commit: true,
                    push: true,
                    connectCommits: false
                }
            }
        }
    });

    // Define Tasks
    grunt.registerTask('serve', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'jekyll:server',
            'sass:server',
            'bowercopy',
            // 'autoprefixer:server',
            'uglify:server',
            'copy:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('phpRun', ['php']);

    grunt.registerTask('server', function() {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });

    grunt.registerTask('build', [
        'useminPrepare',
        'clean:dist',
        'jekyll:dist',
        // 'imagemin',
        // 'svgmin',
        'sass:dist',
        // 'uncss',
        // 'autoprefixer',
        'bower_concat',
        // 'cssmin',
        'uglify:dist',
        // 'critical',
        'usemin',
        // 'htmlmin',
        'copy:build'
    ]);

    grunt.registerTask('deploy', [
        'build',
        'buildcontrol'
    ]);

    grunt.registerTask('default', [
        'serve'
    ]);
};