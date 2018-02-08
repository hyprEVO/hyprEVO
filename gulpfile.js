//PROJECT: hyprEVO 4

// -- Var -- //

//PLUGINS//
var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var wait = require("gulp-wait");
var dirSync = require("gulp-directory-sync");
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var clean = require('gulp-rimraf');
var ftp = require('vinyl-ftp');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var fileinclude = require('gulp-file-include');
var localFilesGlob = ['./build/**'];


//PROJECTS//
var localDir = "http://localhost/hyprEVO/";
var srcDir = "./src/";
var buildDir = "./build/";
var altDir = "C:/xampp/htdocs/hyprEVO/";


// -- UTIL -- //


//Kill build dir
gulp.task('clean', function () {

    return gulp.src('./build', {
        read: false
    }) // much faster
        .pipe(wait(1000))
        .pipe(clean());

});

//Spin up local server
gulp.task('sync', function () {
    browserSync.init({
        proxy: localDir
    });

});

//Reload Browser
gulp.task('reload', function () {
    return gulp.src('')
        .pipe(wait(2000))
        .pipe(browserSync.stream());
});


// -- BASE BUILD TASKS -- //


//Compile SCSS,make-styles --> build
gulp.task('make-styles', function () {
    gulp.src(srcDir + 'scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(buildDir + 'css/'))
        .pipe(gulp.dest(altDir + 'css/'));
});
gulp.task('make-sstyles', function () {
    runSequence('base-dev',
        'make-rest');
});
//Compile JS, make-js --> build
gulp.task('make-js', function () {

    return gulp.src([srcDir + 'js/lib/*.js', srcDir + 'js/core/*.js'])
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest(buildDir + 'js/'))
        .pipe(gulp.dest(altDir + 'js/'));
});

//Image min, make-image --> build
gulp.task('make-image', function () {
    gulp.src(srcDir + 'img/**/**')
        .pipe(imagemin())
        .pipe(gulp.dest(buildDir + 'img/'))
        .pipe(gulp.dest(altDir + 'img/'))

});

//Build everything make-rest --> build
gulp.task('make-rest', function () {
    return gulp.src('')
        .pipe(dirSync(srcDir, buildDir, {
            ignore: ['html','modules', 'img', 'scss', 'css', 'js', 'js/**']
        }))
        .pipe(dirSync(srcDir, altDir, {
            ignore: ['html', 'modules', 'img', 'scss', 'css', 'js', 'js/**']
        }));
});

gulp.task('make-html', function () {
    gulp.src([srcDir + 'index.html'])
        .pipe(fileinclude())
        .pipe(gulp.dest(altDir))
        .pipe(gulp.dest(buildDir));
});
//(styles, js,, sync rest)
gulp.task('construct', function () {
    runSequence('clean',
        'make-styles',
        'make-js',
        'make-html',
        'make-rest');
});

//(styles, js, image, sync rest)
gulp.task('construct-all', function () {
    runSequence('clean',
        'make-styles',
        'make-js',
        'make-html',
        'make-image',
        'make-rest');
});


//-- WATCHERS --//


gulp.task('watch', function () {
    //Source
    gulp.watch(['./src/*.html', './src/modules/*.html', './src/*.html'], ['make-html','make-rest', 'reload']);
    gulp.watch(['./src/*.php'], ['make-html','make-rest', 'reload']);
    gulp.watch(['./src/scss/*.scss', './src/scss/*/*.scss'], ['make-html','make-styles', 'reload']);
    gulp.watch(['./src/js/**/*.js'], ['make-html', 'make-js', 'reload']);
    gulp.watch(['./src/img/**'], ['make-rest', 'reload']);
});


// -- Default -- //

gulp.task('local', ['clean', 'construct', 'sync', 'watch']);
gulp.task('serve', ['sync', 'watch']);