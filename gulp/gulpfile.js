"use strict";

const { src, dest } = require("gulp");
const gulp = require("gulp");
const autoPrefixer = require("gulp-autoprefixer");
const cssnano = require("gulp-cssnano");
const rigger = require("gulp-rigger");
const sass = require("gulp-sass")(require("sass"));
const del = require("del");
const imagemin = require("gulp-imagemin");
const panini = require("panini");
const gulpPlumber = require("gulp-plumber");
const GulpUglify = require("gulp-uglify");
const beautlify = require("gulp-beautify");
const removeCommnets = require("gulp-strip-css-comments");
const gulpStripCssComments = require("gulp-strip-css-comments");
const browserSync = require("browser-sync").create();
const notify = require("gulp-notify");
const rename = require("gulp-rename");

/* Paths */

const srcPath = "src/";
const distPath = "dist/";

const path = {
  build: {
    html: distPath,
    css: distPath + "assets/css/",
    js: distPath + "assets/js/",
    images: distPath + "assets/images/",
    fonts: distPath + "assets/fonts/",
  },
  src: {
    html: srcPath + "*.html",
    css: srcPath + "assets/scss/*.scss",
    js: srcPath + "assets/js/*.js",
    images:
      srcPath +
      "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
    fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2.ttf,svg}",
  },
  watch: {
    html: srcPath + "**/*.html",
    css: srcPath + "assets/scss/**/*.scss",
    js: srcPath + "assets/js/**/*.js",
    images:
      srcPath +
      "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
    fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2.ttf,svg}",
  },
  clean: "./" + distPath,
};

const html = () =>
  src(path.src.html, { base: srcPath })
    .pipe(
      gulpPlumber({
        errorHandler: (error) => {
          notify.onError({
            title: "html error",
            message: "Error: <%= error.message %>",
          })(error);
          this.emit("end");
        },
      })
    )
    .pipe(dest(path.build.html))
    .pipe(browserSync.reload({ stream: true }));

const css = () =>
  src(path.src.css, { base: srcPath + "assets/scss" })
    .pipe(
      gulpPlumber({
        errorHandler: (error) => {
          notify.onError({
            title: "scss error",
            message: "Error: <%= error.message %>",
          })(error);
          this.emit("end");
        },
      })
    )
    .pipe(sass())
    .pipe(autoPrefixer())
    .pipe(
      cssnano({
        zindex: false,
        discardComments: {
          removeAll: true,
        },
      })
    )
    .pipe(gulpStripCssComments())
    .pipe(
      rename({
        suffix: ".min",
        extname: ".css",
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({ stream: true }));

const js = () =>
  src(path.src.js, { base: srcPath + "assets/js/" })
    .pipe(
      gulpPlumber({
        errorHandler: (error) => {
          notify.onError({
            title: "js error",
            message: "Error: <%= error.message %>",
          })(error);
          this.emit("end");
        },
      })
    )
    .pipe(rigger())
    .pipe(GulpUglify())
    .pipe(
      rename({
        suffix: ".min",
        extname: ".js",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browserSync.reload({ stream: true }));

const images = () =>
  src(path.src.images, { base: srcPath + "assets/images" })
    .pipe(imagemin())
    .pipe(dest(path.build.images))
    .pipe(browserSync.reload({ stream: true }));

const fonts = () =>
  src(path.src.fonts, { base: srcPath + "assets/fonts/" }).pipe(
    browserSync.reload({ stream: true })
  );

const clean = () => del(path.clean);

const build = gulp
  .series(clean, gulp.parallel(html, css, js, fonts, images))
  .pipe(browserSync.reload({ stream: true }));

const watchFiles = () => {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.fonts], fonts);
  gulp.watch([path.watch.images], images);
};

const watch = gulp.parallel(build, watchFiles, server);

const server = () =>
  browserSync.init({
    server: {
      baseDir: "./" + distPath,
    },
  });

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
