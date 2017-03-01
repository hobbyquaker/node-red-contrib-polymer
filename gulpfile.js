const gulp = require('gulp');
const vulcanize = require('gulp-vulcanize');
const gulpCopy = require('gulp-copy');
const manifest = require('gulp-manifest');



gulp.task('vulcanize', function() {
    return gulp.src('src/index.html')
        .pipe(vulcanize({
            excludes: ['socket.io/socket.io.js'],
            stripExcludes: []
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('copy', function () {
    return gulp
        .src([
            'src/bower_components/async/dist/async.min.js',
            'src/bower_components/webcomponentsjs/webcomponents-lite.js',
            'src/index.js'
        ])
        .pipe(gulpCopy('dist/', {prefix: 1}))
});

gulp.task('manifest', function(){
    gulp.src(['dist/**/*'], { base: './' })
        .pipe(manifest({
            hash: true,
            preferOnline: false,
            network: ['*'],
            filename: 'app.manifest',
            exclude: 'dist/app.manifest'
        }))
        .pipe(gulp.dest('dist'));
});