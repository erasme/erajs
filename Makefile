
all: compact jsdoc

compact:
	grep '^include(eraBaseDirectory' era/era-debug.js | \
	sed "s/include(eraBaseDirectory+'\(.*\)');/era\/\1/" | \
	xargs google-closure-compiler --define DEBUG=false --compilation_level SIMPLE_OPTIMIZATIONS --js_output_file era/era.js --js 

jsdoc:
	jsdoc -c=doc/jsdoc/conf/era.conf -d=doc/jsdoc/

changelog:
	git log --pretty="* %s" > changelog
