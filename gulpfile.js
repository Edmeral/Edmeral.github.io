var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var browserSync = require('browser-sync');
var spawn = require('child_process').spawn;

gulp.task('build', function() {
    return spawn('jekyll', ['build']);
});

gulp.task('sass', function() {
    return gulp.src('_sass/main.scss')
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(gulp.dest('css'));
});

gulp.task('browser-sync', ['sass', 'build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        },
        port:7890,
    });
});