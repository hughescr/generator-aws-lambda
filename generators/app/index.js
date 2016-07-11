'use strict';

const promisify = require('es6-promisify');

const fs = require('fs');
const readFile = promisify(fs.readFile);

const generators = require('yeoman-generator');
const AWS = require('aws-sdk');

module.exports = generators.Base.extend(
{
    initializing: function() {},

    prompting: function()
    {
        return this.prompt(
        [
            {
                type: 'input',
                name: 'moduleName',
                message: 'Your project\'s lambda name',
                store: true,
                'default': this.appname.replace(/^.*? ([^ ]*)$/, '$1'),
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description of your project',
                store: true,
                'default': 'This is an AWS lambda function',
            },
            {
                type: 'input',
                name: 'githubOrg',
                message: 'Which github Organization should we use?',
                store: true,
                'default': 'hughescr',
            },
            {
                type: 'input',
                name: 'awsRegion',
                message: 'Which AWS region should this lambda deploy to?',
                store: true,
                'default': 'us-west-2',
            },
            {
                type: 'input',
                name: 'awsAccessKey',
                message: 'What is your AWS access key for deployment?',
                store: false,
            },
            {
                type: 'password',
                name: 'awsSecretKey',
                message: 'What is your AWS secret key for deployment?',
                store: false,
            },
            {
                type: 'list',
                name: 'awsCreateNewLambda',
                message: 'Should we create this AWS Lambda (ie it does not already exist?)',
                choices:
                [
                    {
                        name: 'Existing lambda',
                        value: false,
                        'short': 'Existing',
                    },
                    {
                        name: 'Create/New lambda',
                        value: true,
                        'short': 'New',
                    },
                ],
                store: false,
                'default': 0,
            },
        ])
        .then(answers =>
        {
            this.config.set(answers);
            if(answers.awsCreateNewLambda)
            {
                return this.prompt(
                [
                    {
                        type: 'input',
                        name: 'lambaRoleARN',
                        message: 'Enter the ARN for the role to run this lambda under',
                        store: true,
                        default: 'arn:aws:iam::281650663203:role/lambda_basic_execution',
                    },
                    // Should also add Timeout, MemorySize -- just use defaults for now
                ])
                .then(newAnswers =>
                {
                    const lambda = new AWS.Lambda({
                        accessKeyId: answers.awsAccessKey,
                        secretAccessKey: answers.awsSecretKey,
                        region: answers.awsRegion,
                    });
                    const createLambda = promisify(lambda.createFunction, lambda);

                    return readFile(this.templatePath('initial_zip_file/initial.zip'))
                    .then(zipFile =>
                    {
                        return createLambda({
                            Code:
                            {
                                ZipFile: zipFile,
                            },
                            FunctionName: answers.moduleName,
                            Description: answers.description,
                            Runtime: 'nodejs4.3',
                            Role: newAnswers.lambaRoleARN,
                            Handler: 'build/index.handler',
                        });
                    })
                    .then(createLambdaResponse =>
                    {
                        return this.config.set({ awsLambdaARN: createLambdaResponse.FunctionArn });
                    });
                });
            }
            else
            {
                return this.prompt(
                [
                    {
                        type: 'input',
                        name: 'awsLambdaARN',
                        message: 'What is the AWS ARN of the lambda function you want to bind to?',
                        store: true,
                        'default': this.config.get('awsLambdaARN') || `arn:aws:lambda:us-west-2:281650663203:function:${this.config.get('moduleName')}`,
                    },
                ])
                .then(this.config.set.bind(this.config));
            }
        });
    },

    configuring: function() {},

    'default': function() {},

    writing: function()
    {
        this.fs.copy(
            this.templatePath('eslintignore'),
            this.destinationPath('.eslintignore')
        );

        this.fs.copyTpl(
            this.templatePath('eslintrc.js'),
            this.destinationPath('.eslintrc.js'),
            this.config.getAll()
        );

        this.fs.copy(
            this.templatePath('gitignore'),
            this.destinationPath('.gitignore')
        );

        this.fs.copy(
            this.templatePath('npmignore'),
            this.destinationPath('.npmignore')
        );

        this.fs.copy(
            this.templatePath('flowconfig'),
            this.destinationPath('.flowconfig')
        );

        this.fs.copy(
            this.templatePath('babelrc'),
            this.destinationPath('.babelrc')
        );

        this.fs.copy(
            this.templatePath('sublime-project'),
            this.destinationPath(`lambda-${this.config.get('moduleName')}.sublime-project`)
        );

        this.fs.copyTpl(
            this.templatePath('api-keys.json'),
            this.destinationPath('api-keys.json'),
            this.config.getAll()
        );

        this.fs.copy(
            this.templatePath('src/index.js'),
            this.destinationPath('src/index.js')
        );

        this.fs.copy(
            this.templatePath('test/eslintrc.js'),
            this.destinationPath('test/.eslintrc.js')
        );

        this.fs.copy(
            this.templatePath('test/data/lambda-event.json'),
            this.destinationPath('test/data/lambda-event.json')
        );

        this.fs.copy(
            this.templatePath('test/index.js'),
            this.destinationPath('test/index.js')
        );

        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            this.config.getAll()
        );

        this.fs.copyTpl(
            this.templatePath('README.md'),
            this.destinationPath('README.md'),
            this.config.getAll()
        );

        this.gruntfile.prependJavaScript("require('load-grunt-tasks')(grunt);");

        this.gruntfile.insertConfig('clean', JSON.stringify(
        {
            options: { force: true },
            build: ['build/*'],
            coverage: ['coverage/*'],
        }));

        this.gruntfile.insertConfig('eslint', JSON.stringify(
        {
            options:
            {
                maxWarnings: 0,
            },
            lint: ['src', 'test'],
        }));

        this.gruntfile.insertConfig('mochaTest', JSON.stringify(
        {
            test:
            {
                options:
                {
                    require: 'babel-register',
                    reporter: 'spec',
                    quiet: false,
                    clearRequireCache: false,
                },
                src: ['test/**/*.js'],
            },
        }));

        this.gruntfile.insertConfig('flow', JSON.stringify(
        {
            sources: {
                options: {
                    style: 'color',
                },
            },
        }));

        this.gruntfile.insertConfig('babel', JSON.stringify(
        {
            options:
            {
                presets: ['es2015'],
            },
            build:
            {
                files:
                {
                    'build/index.js' : 'src/index.js',
                },
            },
        }));

        this.gruntfile.insertConfig('lambda_package', JSON.stringify(
        {
            'default':
            {
                options:
                {
                    dist_folder: 'build',
                },
            },
        }));

        this.gruntfile.insertConfig('lambda_deploy', JSON.stringify(
        {
            'default':
            {
                arn: this.config.get('awsLambdaARN'),
                options:
                {
                    region: this.config.get('awsRegion'),
                },
            },
        }));

        this.gruntfile.insertConfig('lambda_invoke', JSON.stringify(
        {
            'default':
            {
                options:
                {
                    file_name: 'build/index.js',
                    handler: 'handler',
                    event: 'test/data/lambda-event.json',
                },
            },
        }));

        this.gruntfile.registerTask('lint', 'eslint');
        this.gruntfile.registerTask('test', ['lint', 'flow', 'mochaTest']);
        this.gruntfile.registerTask('build', ['clean', 'babel']);
        this.gruntfile.registerTask('package', ['build', 'lambda_package']);
        this.gruntfile.registerTask('deploy', ['package', 'lambda_deploy']);
        this.gruntfile.registerTask('invoke', ['build', 'lambda_invoke']);

        this.gruntfile.registerTask('default', 'test');
    },

    conflicts: function() {},

    install: function()
    {
        this.npmInstall(
            [
                '@hughescr/eslint-config-flow',
                'babel-cli',
                'babel-eslint',
                'babel-plugin-transform-flow-strip-types',
                'babel-preset-es2015',
                'eslint',
                'eslint-plugin-flowtype',
                'eslint-plugin-promise',
                'eslint-plugin-if-in-test',
                'eslint-plugin-should-promised',
                'grunt',
                'grunt-aws-lambda',
                'grunt-babel',
                'grunt-cli',
                'grunt-eslint',
                'grunt-flow',
                'grunt-contrib-clean',
                'grunt-mocha-istanbul',
                'grunt-mocha-test',
                'istanbul',
                'load-grunt-tasks',
                'mocha',
                'chai',
                'chai-as-promised',
                'chai-datetime',
            ],
            { saveDev: true }
        );

        this.npmInstall(
            [
                '@hughescr/logger',
                'es6-promisify',
                'moment-timezone',
                'nconf',
                'underscore',
            ],
            { save: true }
        );
    },

    end: function() {},
});
