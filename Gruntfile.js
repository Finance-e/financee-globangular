"use strict";

module.exports = function( grunt ) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect:{
            server:{
                options:{
                    port:9001,
                    hostname: 'localhost',
                    open: true
                }
            }
        },
        uglify: {
            dist: {
              files: {
                'dist/financee-globangular.min.js': [
                    'app/app.js','app/directive/ngReallyClick.js',
                    'app/factory/cache.js','app/factory/global.js','app/factory/newtab.js']
              }
            }
        },
        
        watch:{
            js:{
                files:['app/**/*'],
                tasks:['uglify:dist']
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-livereload');
    
    grunt.registerTask('createServer', ['connect:server']);
    grunt.registerTask('build', ['uglify:dist']);
    grunt.registerTask('run', ['createServer', 'watch']);
    
    
};