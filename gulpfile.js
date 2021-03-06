const gulp = require('gulp');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const imagemin = require('gulp-imagemin');
const mocha = require('gulp-mocha');
const nodemon = require('gulp-nodemon');
const stylus = require('gulp-stylus');
const uglify = require('gulp-uglify');

gulp.task('run-clean', () => {
  return gulp.src('./public')
    .pipe(clean());
});

gulp.task('run-concat-uglify-master', () => {
  return gulp.src(['./scripts/master.js'])
    .pipe(concat('master.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/scripts'));
});

gulp.task('run-concat-uglify-private', () => {
  return gulp.src(['./scripts/private.js'])
    .pipe(concat('private.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/scripts'));
});

gulp.task('run-imagemin', () => {
  return gulp.src('./images/**')
	  .pipe(imagemin())
	  .pipe(gulp.dest('./public/images'));
});

gulp.task('run-lint', () => {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('run-nodemon', () => {
  return nodemon({
    script: 'index.js',
    ext: 'js'
  });
});

gulp.task('run-stylus', () => {
  return gulp.src(['./styles/master.styl'])
    .pipe(stylus({compress: true}))
    .pipe(gulp.dest('./public/styles'));
});

gulp.task('run-test', () => {
  let mochaErr;
  let handleMochaError = (err) => {
    console.log('Mocha encountered an error, exiting with status 1');
    console.log('Error:', err.message);
    process.exit(1);
  };

  return gulp.src('./test/**/*.js', {read: false})
    .pipe(mocha())
    .on('error', function(err) {
      console.error('ERROR:', err.message);
      console.error('Stack:', err.stack);

      mochaErr = err;
    })
    .on('end', () => {
      if (mochaErr) return handleMochaError(mochaErr);

      process.exit();
    });
});

gulp.task('watch-test', ['run-test'], () => {
  return gulp.watch(['./test/**/*.js'], ['run-test']);
});

gulp.task('watch-images', () => {
  return gulp.watch(['./images/*'], ['run-imagemin']);
});

gulp.task('watch-scripts', () => {
  return gulp.watch(['./scripts/**/*.js'], ['run-concat-uglify-master', 'run-concat-uglify-private']);
});

gulp.task('watch-styles', () => {
  return gulp.watch(['./styles/**/*.styl'], ['run-stylus']);
});

gulp.task('build', ['run-clean'], () => {
  return gulp.start(['run-imagemin', 'run-stylus', 'run-concat-uglify-master', 'run-concat-uglify-private']);
});

gulp.task('dev', ['build'], () => {
  return gulp.start(['run-nodemon', 'watch-images', 'watch-styles', 'watch-scripts']);
});

gulp.task('test', ['build'], () => {
  return gulp.start(['run-lint', 'run-test']);
});
