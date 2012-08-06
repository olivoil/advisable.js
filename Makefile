SRC = lib/withAdvice.js

all: test clean build docs

build: withAdvice.js withAdvice.min.js

withAdvice.js: $(SRC)
	cat $^ > $@

withAdvice.min.js: withAdvice.js
	uglifyjs --no-mangle $< > $@

test:
	@./node_modules/.bin/mocha --ui exports

clean: docclean
	rm -f withAdvice{,.min}.js

docclean:
	rm -rf ./docs

docs:
	docco lib/*

.PHONY: test clean docs docclean build all
