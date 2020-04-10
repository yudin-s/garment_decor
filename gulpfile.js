var gulp         = require('gulp'),
    pug          = require('gulp-pug'),
    concat       = require('gulp-concat'),
    connect      = require('gulp-connect'),
    consolidate  = require('gulp-consolidate'),
    imageop      = require('gulp-image-optimization'),
    postcss      = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    plumber      = require('gulp-plumber'),
    reporter     = require('postcss-reporter'),
    rename       = require('gulp-rename'),
    precss       = require('precss'),
    cssnano      = require('cssnano'),
    atImport     = require('postcss-import'),
    mqpacker     = require('css-mqpacker'),
    short        = require('postcss-short'),
    cssnext      = require('postcss-cssnext'),
    lost         = require('lost'),
    svgSprite    = require('gulp-svg-sprite'),
	svgmin       = require('gulp-svgmin'),
	cheerio      = require('gulp-cheerio'),
	replace      = require('gulp-replace');

gulp.task('connect', function() {
    connect.server({
        root: 'project',
        livereload: true
    });
});

// Compile to HTML
gulp.task('templates', function() {
    return gulp.src('./dev/blocks/pages/*.pug')
        .pipe(pug({
            pretty: '    '
        }))
        .pipe(gulp.dest('./project/'));
});

gulp.task('svgSpriteBuild', function () {
	return gulp.src('dev/i/icons/*.svg')
	// minify svg
	.pipe(svgmin({
		js2svg: {
			pretty: true
		}
	}))
	// remove all fill, style and stroke declarations in out shapes
	.pipe(cheerio({
		run: function ($) {
			$('[style]').removeAttr('style');
		},
		parserOptions: {xmlMode: true}
	}))
	// cheerio plugin create unnecessary string '&gt;', so replace it.
	.pipe(replace('&gt;', '>'))
	// build svg sprite
	.pipe(svgSprite({
		mode: {
			symbol: {
				sprite: "../sprite.svg",
				render: {
					css: {
						dest:'../../../styles/sprite.css',
						template: "dev/i/icons/sprite_template.css"
					}
				}
			}
		}
	}))
	.pipe(gulp.dest('project/i/sprite/'));
});

gulp.task('css', function () {
    var processors = [
        atImport(),
        short(),
        cssnext({
            browsers: ['last 3 versions', 'Chrome >= 47', 'Firefox >= 43'],
            warnForDuplicates: false
        }),
        precss(),
        autoprefixer(),
        lost(),
        // mqpacker({
        //     sort: false
        // }),
        cssnano({
            browsers: ['last 3 versions', 'Chrome >= 47', 'Firefox >= 43']
        }),
        reporter()
    ];
    return gulp.src('dev/blocks/style.css')
        .pipe(plumber())
        .pipe(postcss(processors))
        .pipe(rename({
            dirname: "/"
        }))
        .pipe(gulp.dest('project/styles/'));
});

gulp.task('html-watch', function () {
    gulp.src('project/*.html')
        .pipe(connect.reload());
});

gulp.task('css-watch', function () {
    gulp.src('project/styles/*.css')
        .pipe(connect.reload());
});

gulp.task('images', function (cb) {
    gulp.src('./dev/i/**/*.+(png|jpg|gif|jpeg)').pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest('./app/i')).on('end', cb).on('error', cb);
});


gulp.task('svgSprite', ['svgSpriteBuild']);

// Default gulp task to run
gulp.task('default', ['connect'], function() {
    gulp.watch(['dev/blocks/**/*.css'], ['css']);
    gulp.watch(['dev/blocks/**/*.pug'], ['templates']);
    gulp.watch(['project/*.html'], ['html-watch']);
    gulp.watch(['project/styles/*.css'], ['css-watch']);
});
