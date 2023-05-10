import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import { stacksvg } from "gulp-stacksvg";
import autoprefixer from 'autoprefixer';
import del from 'del';
import browser from 'browser-sync';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso ()
    ]))
    .pipe(rename ('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML
const minify = () => {
  return gulp.src ('source/*.html')

  .pipe (htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));
}

//Scripts
const scripts = () => {
  return gulp.src ('source/js/*.js')

  .pipe(terser())
  .pipe(gulp.dest('build/js'));
}

//Images
const optimizeImages = () => {
  return gulp.src ('source/img/**/*.{jpg,png}')

  .pipe(squoosh())
  .pipe(gulp.dest('build/img'));
}

const copyImages = () => {
  return gulp.src ('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'));
}

 //Webp
const createWebp = () => {
  return gulp.src ('source/img/**/*.{jpg,png}')

  .pipe(
      squoosh({
        webp: {}
      })
    )
  .pipe(gulp.dest('build/img'));
}

//SVG
const svg = () =>
  gulp.src(['source/img/*.svg', '!source/img/social/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));

function sprite () {
  return gulp.src ('source/img/social/*.svg')

  .pipe(svgo())
  .pipe(stacksvg({ output: `sprite` }))
  .pipe(gulp.dest(`./build/img/`))
}

//Copy
const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

//Clean
export const clean = () => {
  return del('build');
};

// Server

const server = (done) => {
  sync.init({
  server: {
  baseDir: "build"
},
  cors: true,
  notify: false,
  ui: false,
  });
  done();
}

//Reload
const reload = done => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
gulp.watch('source/less/**/*.less', gulp.series(styles));
gulp.watch('source/js/script.js', gulp.series(scripts));
gulp.watch('source/*.html', gulp.series(html, reload));
}

//Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    minify,
    scripts,
    svg,
    sprite,
    createWebp
  ),
);

//Default
export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    minify,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
));
