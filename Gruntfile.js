/**
 * Created by shaun on 3/18/14.
 */
module.exports = function(grunt) {
  grunt.initConfig({
    compass: {
      dev: {
        options: {
          sassDir: 'sass',
          cssDir: 'css',
          watch: true
        }
      },
      build: {
        options: {
          sassDir: 'sass',
          cssDir: 'css'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
};