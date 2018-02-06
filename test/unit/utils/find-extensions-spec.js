'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const modulePath = '../../../lib/utils/find-extensions';

const localExtensions = [
    'mysql',
    'nginx',
    'systemd'
];

describe('Unit: Utils > find-extensions', function () {
    let findExtensions, findStub;

    beforeEach(() => {
        findStub = sinon.stub().returns([
            {
                pkg: {name: 'test'}
            }, {
                pkg: {
                    'ghost-cli': {name: 'rest'}
                }
            }, {
                pkg: {}
            }
        ]);

        findExtensions = proxyquire(modulePath, {
            'find-plugins': findStub,
            execa: {shellSync: () => ({stdout: '.'})}
        });
    });

    it('calls find-plugins with proper args', function () {
        findExtensions();
        expect(findStub.calledOnce).to.be.true;
        const args = findStub.getCall(0).args[0];

        const expected = {
            keyword: 'ghost-cli-extension',
            configName: 'ghost-cli',
            scanAllDirs: true,
            dir: '.',
            sort: true
        };

        const extensions = args.include.map((ext) => ext.split('extensions/')[1]);
        delete args.include;
        expect(extensions).to.deep.equal(localExtensions);
        expect(args).to.deep.equal(expected);
    });

    it('generates proper extension names', function () {
        const names = findExtensions().map((ext) => ext.name);
        const expectedNames = ['test', 'rest', undefined];
        expect(names).to.deep.equal(expectedNames);
    });
});
