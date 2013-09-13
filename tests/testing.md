#The objective:
building a comprehensive test suite for the opentaba-client. allowing us to accept pull requests with [Travic-CI]() integration, tinker with the code etc..

##how?

###functional testing:
* using [Casperjs](http://casperjs.org/) above the [Phantomjs](http://phantomjs.org/index.html) headless webkit browser or [slimer.js](http://slimerjs.org/) gecko based headless browser to do functional testing.
* maybe we'll also use saucelabs selenium testing service

###Unit testing:

Didn't touch that yet

* need to choose a testing framework: [Jasmine](http://pivotal.github.io/jasmine/), [Mocha](http://visionmedia.github.io/mocha/)
* also need to choose a test runner: [karma](http://karma-runner.github.io/0.10/index.html), [Intern](http://theintern.io/) or other

**We'll be glad for help with this.**

###Setting up dependencies:  
you need npm installed (the ```node.js``` package manager) to install dependencies.

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

###current state:

 just starting with functional testing
