(function () {
   'use strict';
   module.exports = function( grunt ) {
        require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            connect:{
                server:{
                    options:{
                        port:9010,
                        hostname: 'localhost',
                        open: true
                    }
                }
            },
            concat: {
                js: {
                    src: 'app/**/*.js',
                    dest: 'dist/financee-globangular.js'
                }
            },
            uglify: {
                dist: {
                  files: {
                    'dist/financee-globangular.min.js': ['dist/financee-globangular.js']
                  }
                }
            },

            jshint: {
                all: ['Gruntfile.js', 'app/**/*.js', 'test/**/*.js'],
                beforeconcat: ['app/**/*.js'],
                afterconcat: ['dist/financee-globangular.js'],
                gruntfile: ['Gruntfile.js']
            },

            watch:{
                gruntfile: {
                    files: 'Gruntfile.js',
                    tasks: ['jshint:gruntfile'],
                    options: {
                          interrupt: true,
                          livereload: true
                    }
                },
                js:{
                    files:['app/**/*'],
                    tasks:['concat','jshint:beforeconcat','uglify:dist','jshint:afterconcat'],
                    options: {
                        interrupt: true,
                        port: 9010,
                        livereload: true
                    }
                }
            }
        });

        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-connect');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-watch');
        
        grunt.registerTask('createServer', ['connect:server']);
        grunt.registerTask('build', ['concat','uglify:dist','jshint:all']);
        grunt.registerTask('run', ['createServer', 'watch']);

    };
}());