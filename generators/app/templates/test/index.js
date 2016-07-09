'use strict';
/* @flow */

const main = require('../src/index.js');
const data = require('./data/lambda-event.json');

const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-datetime'));
chai.should();
const expect = chai.expect;
expect(true).to.be.equal(true);

describe('Dumb example', () =>
{
    it('should get called back', (done: Function) =>
    {
        main.handler(data, {}, done);
    });
});

describe('Unit', () =>
{
    it('should define some unit tests');
});

describe('Feature', () =>
{
    it('should define some feature tests');
});
