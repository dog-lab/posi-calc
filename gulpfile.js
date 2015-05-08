/* jshint mocha: true, node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
/*  Load all gulp plugins automatically and attach them to the `plugins` object */
var plugins = require('gulp-load-plugins')();
/*  Temporary solution until gulp 4 https://github.com/gulpjs/gulp/issues/355 */
var runSequence = require('run-sequence');
var pkg = require('./package.json');
var dirs = pkg['posi-calc-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------
gulp.task(
  'archive:create_archive_dir', function() {
    //noinspection JSUnresolvedFunction
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
  }
);

gulp.task(
  'archive:zip', function(done) {
    var archiveName = path.resolve(dirs.archive, pkg.name + '-v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    //noinspection JSUnresolvedVariable
    var files = require('glob').sync(
      '**/*.*', {
        cwd: dirs.dist,

        // include hidden files
        dot: true
      }
    );
    //noinspection JSUnresolvedFunction
    var output = fs.createWriteStream(archiveName);

    //noinspection JSUnresolvedFunction
    archiver.on(
      'error', function(error) {
        done();
        throw error;
      }
    );

    output.on('close', done);

    files.forEach(
      function(file) {
        //noinspection JSUnresolvedVariable
        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        //noinspection JSUnresolvedFunction
        archiver.append(
          fs.createReadStream(filePath), {
            name: file,
            mode: fs.statSync(filePath)
          }
        );

      }
    );

    //noinspection JSUnresolvedFunction,JSUnresolvedFunction
    archiver.pipe(output);
    //noinspection JSUnresolvedFunction
    archiver.finalize();
  }
);

gulp.task(
  'clean', function(done) {
    //noinspection JSUnresolvedVariable
    require('del')(
      [
        dirs.archive,
        dirs.dist
      ], done
    );
  }
);

gulp.task(
  'copy', [
    'copy:license',
    'copy:main.css',
    'copy:misc',
    'copy:normalize'
  ]
);

gulp.task(
  'copy:html', function() {
    //noinspection JSUnresolvedVariable
    return gulp.src(gulp.src + '*.html')
      .pipe(gulp.dest(dirs.dist));
  }
);

gulp.task(
  'copy:license', function() {
    //noinspection JSUnresolvedVariable
    return gulp.src('LICENSE.txt')
      .pipe(gulp.dest(dirs.dist));
  }
);

gulp.task(
  'copy:main.css', function() {
    //noinspection JSUnresolvedVariable
    var banner = '/*! HTML5 Boilerplate v' + pkg.version +
                 ' | ' + pkg.license.type + ' License' +
                 ' | ' + pkg.homepage + ' */\n\n';

    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    return gulp.src(dirs.src + '/css/main.css')
      .pipe(plugins.header(banner))
      .pipe(
      plugins.autoprefixer(
        {
          browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
          cascade: false
        }
      )
    )
      .pipe(gulp.dest(dirs.dist + '/css'));
  }
);

gulp.task(
  'copy:misc', function() {
    //noinspection JSUnresolvedVariable
    return gulp.src(
      [

        // Copy all files
        dirs.src + '/**/*'

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        // '!' + dirs.src + '/css/main.css',
        // '!' + dirs.src + '/index.html'

      ], {

        // Include hidden files by default
        dot: true
      }
    ).pipe(gulp.dest(dirs.dist));
  }
);

gulp.task(
  'copy:normalize', function() {
    //noinspection JSUnresolvedVariable
    return gulp.src('node_modules/normalize.css/normalize.css')
      .pipe(gulp.dest(dirs.dist + '/css'));
  }
);

gulp.task(
  'lint:js', function() {
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable,JSUnresolvedVariable
    return gulp.src(
      [
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js'
      ]
    ).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
  }
);

gulp.task('minify-css', function() {
  //noinspection JSUnresolvedFunction,JSUnresolvedVariable
  return gulp.src(['node_modules/normalize.css/normalize.css', dirs.src + '/css/*.css'])
    .pipe(plugins.concat('styles.css'))
    .pipe(plugins.minifyCss())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('minify-js', function() {
  //noinspection JSUnresolvedFunction,JSUnresolvedVariable
  gulp.src(dirs.src + '/js/*.js')
    .pipe(plugins.concat('scripts.js'))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(dirs.dist + '/js'));
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------
gulp.task(
  'archive', function(done) {
    runSequence(
      'build',
      'archive:create_archive_dir',
      'archive:zip',
      done
    );
  }
);

gulp.task(
  'build', function(done) {
    runSequence(
      ['clean', 'lint:js'],
      'copy',
      done
    );
  }
);

gulp.task('default', ['build']);
