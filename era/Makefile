
all:
	grep '^include(eraBaseDirectory' js/era-debug.js | sed "s/include(eraBaseDirectory+'\(.*\)');/js\/\1/" | xargs cat > js/era-tmp.js
	yui-compressor js/era-tmp.js > js/era.js
	rm js/era-tmp.js

