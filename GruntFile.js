module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-gcc');

	//noinspection JSUnresolvedFunction
	grunt.initConfig({
		concat: {
			options: {
				separator: '\n\n\n'
			},

			build: {
				src: ['src/classes/*.js',
					'src/fixes/*.js',
					'src/index.js'],

				dest: 'build/fix.js'
			}
		},
		uglify: {
			build: {
				src : ['build/fix.js'],
				dest: 'build/fix.min.js'
			}
		}

		/*		gcc: {
		 build: {
		 src : 'build/fix.js',
		 dest: 'build/fix.min.js'
		 }
		 }*/
	});

	grunt.registerTask('default', ['concat', 'uglify']);

};
