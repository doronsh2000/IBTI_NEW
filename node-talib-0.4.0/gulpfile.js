var gulp=require('gulp');
var jshint=require('gulp-jshint');
var jsFiles=['*.js','examples/*.js'];
var jscs=require('gulp-jscs');

gulp.task('style',function(){
    return gulp.src(jsFiles)
	.pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish',{
		verbose: true
	}))
	.pipe(jscs());
});
