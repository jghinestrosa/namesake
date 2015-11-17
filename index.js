'use strict';

var fs = require('fs');
var async = require('async');

function namesake(path) {
  var _files = {};

  function readDirectory(path, next) {
    fs.readdir(path, function(err, files) {
      files.forEach(function(filename) {
        if (filename[0] !== '.') {
          _files[filename] = {
            functions: []
          };
        }
      });

      next();
    });
  }

  function readFile(dirpath, filename, callback, next) {
    fs.readFile(dirpath + '/' + filename, function(err, data) {
      callback(filename, data.toString('utf8'));
      next();
    });
  }

  function getFileExtension(filename) {
    return filename.split('.').pop();
  }

  function getFunctionPattern(fileExtension) {
    switch (fileExtension) {
      case 'py':
        return /def .+\:/g;
      default:
        return null;
    }
  }

  function loadFunctions(next) {
    var files = Object.keys(_files);

    async.each(files, function(filename, callback) {
      readFile(path, filename, findFunctions, callback);
    },
    function(err) {
      if (err) {
        console.log(err);
      }

      next();
    });
  }

  function findFunctions(filename, content) {
    var pattern = getFunctionPattern(getFileExtension(filename));
    var fns = content.match(pattern);

    if (fns !== null && _files[filename]) {
      fns.forEach(function(fn) {
        _files[filename].functions.push(fn);
      });
    }
  }

  function findOccurrences(files) {
    var ocurrences = {};

    var filenames = Object.keys(files);

    filenames.forEach(function(filename) {
      var fns = files[filename].functions;
      fns.forEach(function(fn) {
        if (!ocurrences[fn]) {
          ocurrences[fn] = new Set();
        }
        ocurrences[fn].add(filename);
      });
    });

    return ocurrences;
  }

  function printOccurrences(occurrences) {
    var fns = Object.keys(occurrences);
    fns.forEach(function(fn) {
      if (occurrences[fn].size > 1) {
        console.log(fn);
        occurrences[fn].forEach(function(filename) {
          console.log('\t' + filename);
        });
      }
    });
  }

  async.series([
    function(callback) {
      readDirectory(path, callback);
    },

    function(callback) {
      loadFunctions(callback);
    }
  ],
  
  function(err, results) {
    if (err) {
      console.log(err);
    }

    var ocurrences = findOccurrences(_files);
    printOccurrences(ocurrences);

  });
}

module.exports = namesake;
