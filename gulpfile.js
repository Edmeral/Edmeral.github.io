var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var browserSync = require('browser-sync');
var spawn = require('child_process').spawn;

gulp.task('build', function(done) {
    return spawn('jekyll', ['build'])
        .on('close', done); // build task only returns when it's finished building.
});

gulp.task('sass', function() {
    return gulp.src('_sass/main.scss')
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(gulp.dest('css'))
        .pipe(gulp.dest('_site/css'));
});

gulp.task('browser-sync', ['sass', 'build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        },
        browser: "nothing",
        port:7890
    });
});

gulp.task('watch', function() {
    gulp.watch('_sass/*', ['sass', browserSync.reload]);
    gulp.watch(['index.html', '_config.yml', '*.md', 'feed.xml', '_layouts/*.html', '_includes/*.html', '_posts/*'], ['build', browserSync.reload]);
});

gulp.task('default', ['browser-sync', 'watch']);