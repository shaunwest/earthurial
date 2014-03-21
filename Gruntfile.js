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
          watch: true,
          require: 'singularitygs'
        }
      },
      build: {
        options: {
          sassDir: 'sass',
          cssDir: 'css',
          require: 'singularitygs'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
};