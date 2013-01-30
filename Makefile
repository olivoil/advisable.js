SRC = lib/withAdvice.js
TESTS = $(shell find test -name "*.test.js")
MOCHA_REPORTER = spec
TEST_FILE = test/support/tests.html

all: clean build test
test: test_node test_browser
build: withAdvice.js withAdvice.min.js

withAdvice.js: $(SRC)
	cat $^ > $@

withAdvice.min.js: withAdvice.js
	uglifyjs --no-mangle $< > $@

test_node:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(MOCHA_REPORTER) \
		--bail \
		$(TESTS)

test_browser:
	@NODE_ENV=test ./node_modules/mocha-phantomjs/bin/mocha-phantomjs \
		--reporter $(MOCHA_REPORTER) \
		$(TEST_FILE)

clean:
	rm -f withAdvice{,.min}.js

.PHONY: test_node
