'use strict';

var fs = require('fs');

function namesake(path) {
  var _files = {};

  function readDirectory(path) {
    fs.readdir(path, function(err, files) {
      files.forEach(function(file) {
        _files[file] = {
          functions: []
        };
      });
    });
  }
}

module.exports = namesake;
