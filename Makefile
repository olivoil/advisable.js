SRC = $(shell find ./lib -name "*.js")
TEST = $(shell find ./test -name "*.js")

dist: node_modules components $(SRC) $(TEST)
	@bin/build

node_modules: package.json
	@npm install --dev

components: component.json
	@./node_modules/component/bin/component install --dev

test: dist
	@./node_modules/karma/bin/karma start

clean:
	@rm -rf components dist

.PHONY: clean test
