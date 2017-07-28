/**
* Grunt commands
*/

"use strict";

module.exports = function(grunt) {

    // Load grunt tasks
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Specify the grunt tasks
    grunt.initConfig({
        // Express JS server configuration
        nodemon: {
            dev: {
                options: {
                    script: "server.js",
                    options: {
                        callback: function(nodemon) {
                            console.log("Starting node server...");
                        },
                        env: {
                            PORT: "3000"
                        }
                    }
                }
            }
        },

        // Automatically inject bower components to the app
        wiredep: {
            app: {
                src: [ "app/index.html" ]
            }
        },

        compass: {
            dist: {
                options: {
                    sassDir: "themes/custom/syntaxsofts_base/sass",
                    cssDir: "themes/custom/syntaxsofts_base/css"
                }
            },
            clean: {
                options: {
                    sassDir: "themes/custom/syntaxsofts_base/sass",
                    cssDir: "themes/custom/syntaxsofts_base/css",
                    clean: true
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    "themes/custom/syntaxsofts_base/js/main.js": ["themes/custom/syntaxsofts_base/lib/*.js"]
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            scripts: {
                files: ["server.js"],
                tasks: ["build"]
            }
        }
    });

    grunt.registerTask("inject", [
        "wiredep"
    ]);

    grunt.registerTask("build", [
        "watchChange"
    ]);

    grunt.registerTask("watchChange", [
        "wiredep",
        "nodemon"
    ]);

};