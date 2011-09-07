
all: compact sampleshighlight jsdoc

compact:
	grep '^include(eraBaseDirectory' era/era-debug.js | sed "s/include(eraBaseDirectory+'\(.*\)');/era\/\1/" | xargs cat > era/era-tmp.js
	yui-compressor era/era-tmp.js > era/era.js
	rm era/era-tmp.js

sampleshighlight:
	find samples -iname \*.html -type f -exec code2html -H -l Javascript {} {}.highlight \;
	rm samples/index.html.highlight

jsdoc:
	jsdoc -c=doc/jsdoc/conf/era.conf -d=doc/jsdoc/
