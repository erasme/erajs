
all:
	grep 'include(eraBaseDirectory' js/era-debug.js | sed "s/include(eraBaseDirectory+'\(.*\)');/js\/\1/" | xargs cat > js/era.js

