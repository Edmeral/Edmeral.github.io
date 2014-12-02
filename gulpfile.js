var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var browserSync = require('browser-sync');
var cp = require('child_process');

gulp.task('sass', function() {
    return gulp.src('_sass/main.scss')
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(gulp.dest('css'));
});