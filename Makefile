
all: compact

compact:
	make -f Makefile --directory=era/

clean:
	make -f Makefile --directory=era/ clean

jsdoc:
	jsdoc -c=doc/jsdoc/conf/era.conf -d=doc/jsdoc/

changelog:
	git log --pretty="* %s" > Changelog
