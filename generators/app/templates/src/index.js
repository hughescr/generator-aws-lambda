'use strict';
<% if(useFlow) {  %>/* @flow */<%  } %>

const nconf = require('nconf');
nconf.argv()
     .env()
     .file({ file: 'api-keys.json' });

const AWS = require('aws-sdk');
AWS.config.update(
{
    accessKeyId:     nconf.get('AWS:ACCESS_KEY_ID'),
    secretAccessKey: nconf.get('AWS:SECRET_ACCESS_KEY'),
    region:          nconf.get('AWS:REGION'),
});

const moment = require('moment-timezone');
moment.tz.setDefault('US/Pacific');

const loggers = require('@hughescr/logger');
const logger = loggers.logger;

// This handler uses some ES6 stuff like arrow functions
exports.handler = function(event: any, context: any, callback: Function): any
{
    logger.info('Hello world!', { event: event });
    Promise.resolve()
    .then((): any =>
    {
        return callback(null, { result: 'Completed OK!' });
    })
    .catch((err: any): any =>
    {
        return callback(err);
    });
};
