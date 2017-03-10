const gulp =        require('gulp');
const clean =       require('gulp-clean');
const vulcanize =   require('gulp-vulcanize');
const gulpCopy =    require('gulp-copy');
const manifest =    require('gulp-manifest');

gulp.task('clean', function () {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
});

gulp.task('vulcanize', ['clean'], function () {
    return gulp.src('src/index.html')
        .pipe(vulcanize({
            excludes: ['socket.io/socket.io.js'],
            stripExcludes: []
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('copy', ['clean'], function () {
    return gulp
        .src([
            'src/bower_components/async/dist/async.min.js',
            'src/bower_components/webcomponentsjs/webcomponents-lite.js',
            'src/bower_components/web-animations-js/web-animations-next-lite.min.js',
            'src/bower_components/components-font-awesome/css/font-awesome.min.css',
            'src/bower_components/components-font-awesome/fonts/*',
            'src/index.js'
        ])
        .pipe(gulpCopy('dist/', {prefix: 1}))
});

gulp.task('manifest', ['vulcanize', 'copy'], function (){
    gulp.src(['dist/**/*'], { base: './' })
        .pipe(manifest({
            hash: true,
            timestamp: false,
            preferOnline: false,
            network: ['*'],
            filename: 'app.manifest',
            exclude: 'dist/app.manifest'
        }))
        .pipe(gulp.dest('dist'));
});


gulp.task('default', ['clean', 'vulcanize', 'copy', 'manifest']);
