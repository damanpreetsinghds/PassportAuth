'use strict';
/**
 * @module gulp
 * Build configuration file with proper linting rules.
 */

/** Modules import */
var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var fs = require('fs');
var buffer = require('gulp-buffer');
var clean = require('gulp-clean');
var awspublish = require('gulp-awspublish');
var zip = require('gulp-zip');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var seq = require('gulp-sequence');

/** Local Imports */
var logManager = require('./utils/log-manager.js');

/** Global Vars */
var logger = logManager.getLogger();
var SRC = ['./routes/**', './secret/*.js', './utils/*.js', './config/**', 'app.js', 'footer.md', 'header.md', 'package.json', './bin/*js'];
var LINT_SRC = ['./routes/**', './secret/*.js', './server/**', './test/*.js', 'utils/*.js', 'app.js', 'server.js', './config/*.js'];

/** Begin */
gulp.task('begin', function () {
    logger.info('Build Started');
    gulp.src('./*.js')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .on('finish', function () {
            gutil.log('Packaging!!');
        });
});

/** Check the js styling sheets */
gulp.task('jscs', function () {
    return gulp.src(LINT_SRC)
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
});

/** Check linting rules */
gulp.task('jshint', function () {
    logger.info('Running lint rules');
    return gulp.src(LINT_SRC)
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(jshint.reporter('fail'));
});

/** Clean the dist folder */
gulp.task('clean', function () {
    logger.info('Cleaning dist folder');
    return gulp.src('./dist/*', {read: false})
        .pipe(buffer())
        .pipe(clean());
});

/** Package the directory */
gulp.task('package', function () {
    return gulp.src(SRC, {base: '.'})
        .pipe(zip('pre-webapp.tar.gz'))
        .pipe(buffer())
        .pipe(gulp.dest('dist'));
});

/** Emit done. */
gulp.task('done', function () {
    logger.info('Done::::');

    gulp.src('./*.js')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .on('finish', function () {
            gutil.log('Deployed to S3 Bucket!!');
        });
});

gulp.task('lint', seq('jshint', 'jscs'));

gulp.task('default', seq('begin', 'clean', 'package', 'done'));