
all: compact jsdoc

compact:
	grep '^include(eraBaseDirectory' era/era-debug.js | sed "s/include(eraBaseDirectory+'\(.*\)');/era\/\1/" | xargs tools/preprocessor -o era/era-tmp.js
	yui-compressor era/era-tmp.js > era/era.js
	rm era/era-tmp.js

jsdoc:
	jsdoc -c=doc/jsdoc/conf/era.conf -d=doc/jsdoc/

changelog:
	git log --pretty="* %s" > changelog
