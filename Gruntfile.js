module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: 'client/build/b-client.js',
        dest: 'public/js/client.js'
      }
    },
    browserify: {
      dist: {
        files: {
          'public/js/bundle.js': ['client/main.js'],
        },
        options: {
          browserifyOptions: {
            fullPaths: false
          }
        }
      }
    },
    watch:{
      files: ["client/*.js"],
      tasks: ['build']
    },
    qunit: {
      all: ['tests/*.html']
    }
  });
  // Load the plugin that provides the "uglify" task
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // Default task(s)
  grunt.registerTask('default', ['browserify', 'watch']);
  grunt.registerTask('build', ['browserify','qunit'/*,'uglify'*/]);
};