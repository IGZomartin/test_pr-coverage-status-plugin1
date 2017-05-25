'use strict';

const expect = require('expect.js');
const _ = require('lodash');
const fs = require('fs');
const plist = require('../../../lib/managers/plist');

describe('Plist manager', function() {

  let validProduct = require('../../fixtures/product/validProduct.json');
  let validCompilation = require('../../fixtures/compilation/duplicateCompilation.json');
  let url = 'https://s3.amazonaws.com/igz-node-myBucket-test/file/test.txt?AWSAccessKeyId=VALID_EXAMPLE_URL';

  describe('Parameter validation', function() {

    it('should fail without product', function() {
      expect(function() {
        plist.buildPlist(null, validCompilation, url);
      }).to.throwError(/Missing product/);
    });

    it('should fail without product name', function() {
      expect(function() {
        let invalidProd = _.clone(validProduct);
        delete invalidProd.name;
        plist.buildPlist(invalidProd, validCompilation, url);
      }).to.throwError(/Missing product name/);

    });

    it('should fail without compilation', function() {
      expect(function() {
        plist.buildPlist(validProduct, null, url);
      }).to.throwError(/Missing compilation/);
    });

    it('should fail without compilation version', function() {
      expect(function() {
        let invalidComp = _.clone(validCompilation);
        delete invalidComp.version;
        plist.buildPlist(validProduct, invalidComp, url);
      }).to.throwError(/Missing compilation version/);
    });

    it('should fail without url', function() {
      expect(function() {
        plist.buildPlist(validProduct, validCompilation, null);
      }).to.throwError(/Missing compilation url/);

    });

  });

  describe('Plist generation', function() {

    it('generates a xml string', function() {
      let xml = plist.buildPlist(validProduct, validCompilation, url);
      let plistTest = fs.readFileSync(__dirname + '/example.plist').toString();

      expect(xml).to.be.a('string');
      expect(xml).to.equal(plistTest);
    });

  });

});
