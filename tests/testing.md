#The objective:
building a comprehensive test suite for the opentaba-client. allowing us to accept pull requests with [Travic-CI]() integration, tinker with the code etc..

##how?

###functional testing:
* Using [Casperjs](http://casperjs.org/) above the [Phantomjs](http://phantomjs.org/index.html) headless webkit browser or [slimer.js](http://slimerjs.org/) gecko based headless browser to do functional testing.

* Also using [PhantomCSS](https://github.com/alonisser/PhantomCSS) (a specific fork) to test for the map rendering (can't be tested by the DOM because doesn't appear there, pure js)

* Using [sinon]() for stubbing and mocking. Notice we currently are using two versions of sinon. one in ```node_modules``` for server side node work adapted as a node module. and the version in ```tests\sinon-1.7.3.js``` for injecting browserside testing.

* TODO: maybe we'll also use saucelabs selenium testing service

###Unit testing:

Didn't touch that yet

* need to choose a testing framework: [Jasmine](http://pivotal.github.io/jasmine/), [Mocha](http://visionmedia.github.io/mocha/)
* also need to choose a test runner: [karma](http://karma-runner.github.io/0.10/index.html), [Intern](http://theintern.io/) or other
* using [chai](http://chaijs.com/) matchers
**We'll be glad for help with this.**

###Setting up dependencies:
you need npm installed (the ```node.js``` package manager) to install dependencies.

    git submodule update --init (in the project root)
    cd tests
    npm install grunt-cli -g
    npm install


###running the tests:

    cd tests
    npm test

or specific tests:

   cd tests
   grunt jshint
   grunt casperjs

###Adding new tests:

* If adding new casperjs tests, they should be also added to the file array in the **Gruntfile** casperjs task.

###current state:

 * Basic functional testing for index.html works, including map image regression test.
 * working on More functional testing - for displayed plans
 * integrated jshint but doesn't fail by it yet. need to bring down the number of js alerts on app.js for that.
