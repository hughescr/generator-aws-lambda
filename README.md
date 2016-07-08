Overview
========

This is a scaffold for the basic structure of a NodeJS AWS lambda function, which can be written in ES6 with Flow annotations, and will get transpiled down to something Lambda is happy with.

Use
===

Install yo and the generator (probably globally), create a directory for your project, then run the generator in that directory

```
npm -g install yo @hughescr/generator-aws-lambda
mkdir sample-project
cd sample-project
yo @hughescr/aws-lambda
```

Answer the questions for the config you want, then sit back and it'll build and set up:

* Main source stub
* Unit test stubs
* ESLint
* Grunt, including
  - `lint` target which runs lint
  - `test` target which runs tests & coverage report\
  - `package` target which creates a ZIP file you can upload to AWS
  - `deploy` target which will update a lambda on AWS with the code
  - `invoke` target which will test-invoke your lambda locally passing it an event you can specify
* NPM package.json, including
  - `postversion` script which handles git updating of version ticking
