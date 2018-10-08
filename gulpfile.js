var gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  del = require('del'),
  concat = require('gulp-concat'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  sourcemaps = require('gulp-sourcemaps'),
  htmlmin = require('gulp-htmlmin'),
  uglify = require('gulp-uglify'),
  autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {
  return gulp.src('src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(['last 2 versions', '> 1%', 'ie 11'], { cascade: true }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('src/css/'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('css-libs', ['sass'], function() {
  return gulp.src('src/css/index.css')
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('src/css'));
});

gulp.task('deployScripts', function() {
  return gulp.src(['src/js/index.js'])
    .pipe(concat('index.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('src/js'));
});

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'src'
    },
    notify: false
  });
});

gulp.task('watch', ['browser-sync', 'css-libs', 'sass', 'deployScripts'], function() {
  gulp.watch('src/sass/**/*.scss', ['sass']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/*.js', browserSync.reload);
});

gulp.task('clean', function() {
  return del.sync('docs');
});

gulp.task('img', function() {
  return gulp.src('src/img/**/*')
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('docs/img'));
});

gulp.task('minifyHtml', function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('docs/'));
});

gulp.task('build', ['clean', 'img', 'sass', 'deployScripts', 'minifyHtml'], function() {

  var buildCss = gulp.src('src/css/index.min.css')
    .pipe(gulp.dest('docs/css'));

  var buildJs = gulp.src('src/js/*.js')
    .pipe(gulp.dest('docs/js'));
});

gulp.task('default', ['watch']);
