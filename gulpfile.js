var gulp = require('gulp'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    importCss = require('gulp-cssimport'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    isProduction = !!util.env.production;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    prod: {
        js: 'prod/js/',
        css: 'prod/css/',
        img: 'prod/img/',
        fonts: 'prod/fonts/'
    },
    dev: {
        html: 'dev/*.html',
        js: require('./dev/js/scripts.js'),
        style: 'dev/styles/*.scss',
        img: 'dev/img/**/*.*',
        fonts: 'dev/fonts/**/*.*'
    },
    watch: {
        html: 'dev/**/*.html',
        js: 'dev/**/*.js',
        style: 'dev/styles/**/*.*',
        img: 'dev/**/img/**/*.*',
        fonts: 'dev/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "ds",
    notify: false,
    logSnippet: false,
    logConnections: false
};

gulp.task('html:build', function() {
    gulp.src(path.dev.html)
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function() {
    gulp.src(path.dev.js.main)
        .pipe(isProduction ? util.noop() : sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(isProduction ? uglify().on('error', util.log) : util.noop())
        .pipe(isProduction ? util.noop() : sourcemaps.write())
        .pipe(gulp.dest(isProduction ? path.prod.js : path.build.js))
        .pipe(reload({stream: true}));

    gulp.src(path.dev.js.libs)
        .pipe(concat('libs.js'))
        .pipe(isProduction ? uglify().on('error', util.log) : util.noop())
        .pipe(gulp.dest(isProduction ? path.prod.js : path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function() {

    gulp.src(path.dev.style)
        .pipe(importCss({
            extensions: ["css"]
        }))
        .pipe(isProduction ? util.noop() : sourcemaps.init())
        .pipe(sass({
            sourcemap: !isProduction,
            outputStyle: isProduction ? 'compressed' : 'nested'
        }).on('error', function(err) {
            util.log(err);
            browserSync.notify(err.message, 10000);
            this.emit('end');
        }))
        .pipe(isProduction ? util.noop() : sourcemaps.write())
        .pipe(gulp.dest(isProduction ? path.prod.css : path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function() {
    gulp.src(path.dev.img)
        .pipe(gulp.dest(isProduction ? path.prod.img : path.build.img));
});

gulp.task('fonts:build', function() {
    gulp.src(path.dev.fonts)
        .pipe(gulp.dest(isProduction ? path.prod.fonts : path.build.fonts));
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('serve', function() {
    browserSync(config);
});

gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

gulp.task('prod', function() {
    rimraf(path.clean, function() {
        isProduction = true;
        gulp.start('build')
    });
});

gulp.task('watch', function() {
    watch([path.watch.html], function() {
        gulp.start('html:build');
    });
    watch(path.watch.style, function() {
        gulp.start('style:build');
    });
    watch(path.watch.js, function() {
        delete require.cache[require.resolve('./dev/js/scripts.js')];
        path.dev.js = require('./dev/js/scripts.js');
        gulp.start('js:build');
    });
    watch([path.watch.img], function() {
        // gulp.start('image:build');
    });
    watch([path.watch.fonts], function() {
        // gulp.start('fonts:build');
    });
});

gulp.task('default', ['build', 'serve', 'watch']);
