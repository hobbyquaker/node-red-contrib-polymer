const gulp =        require('gulp');
const clean =       require('gulp-clean');
const vulcanize =   require('gulp-vulcanize');
const gulpCopy =    require('gulp-copy');
const manifest =    require('gulp-manifest');
const fs =          require('fs');

gulp.task('default', ['clean', 'vulcanize', 'copy', 'manifest']);


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
            'src/bower_components/promise-polyfill/Promise.js',
            'src/bower_components/promise-polyfill/Promise-Statics.js',
            'src/bower_components/components-font-awesome/fonts/*',
            'src/bower_components/store-js/store.min.js',
            'src/node_modules/canvas-gauges/gauge.min.js',
            'src/index.js'
        ])
        .pipe(gulpCopy('dist/', {prefix: 1}))
});

gulp.task('manifest', ['vulcanize', 'copy'], function () {
    gulp.src(['dist/**/*'], { base: './dist' })
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


gulp.task('fa-autocomplete', function () {

    let files = [
        'nodes/paper-button.html',
        'nodes/nav_page.html'
    ];

    let css = fs.readFileSync('src/bower_components/components-font-awesome/css/font-awesome.css').toString();
    let res = [];
    css.split('\n').forEach(line => {
        let match = line.match(/^\.fa-(.*):before {$/);
        if (match) res.push(match[1]);
    });
    res = JSON.stringify(res);

    files.forEach(file => {
        let content = fs.readFileSync(file).toString();
        let out = [];
        content.split('\n').forEach(line => {
            if (line.indexOf('/* fa-autocomplete */') === 0) {
                out.push('/* fa-autocomplete */ source: ' + res);
            } else {
                out.push(line);
            }
        });
        fs.writeFileSync(file, out.join('\n'));
    });
});