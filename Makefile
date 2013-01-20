SRC = lib/withAdvice.js
TESTS = $(shell find test -name "*.test.js")
MOCHA_REPORTER = spec

all: test clean build

build: withAdvice.js withAdvice.min.js

withAdvice.js: $(SRC)
	cat $^ > $@

withAdvice.min.js: withAdvice.js
	uglifyjs --no-mangle $< > $@

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(MOCHA_REPORTER) \
		--bail \
		$(TESTS)

clean:
	rm -f withAdvice{,.min}.js

.PHONY: test clean
