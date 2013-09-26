
all: compact

compact:
	grep '^include(eraBaseDirectory' era-debug.js | \
	sed "s/include(eraBaseDirectory+'\(.*\)');/\1/" | \
	xargs closure-compiler --define DEBUG=false --compilation_level SIMPLE_OPTIMIZATIONS --js_output_file era.js --js 

clean:
	

