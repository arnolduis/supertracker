  // routes/index.js
var fs = require('fs'),
    validFileTypes = ['js'];
var path = require('path');

 
var requireFiles = function (directory, app, stpath, bufferSize, bufferTimeLimit, db) {
  fs.readdirSync(directory).forEach(function (fileName) {
    // Recurse if directory
    var target = path.join(directory, fileName);

    if(fs.lstatSync(target).isDirectory()) {
      requireFiles(target, app, stpath, bufferSize, bufferTimeLimit, db);
    } else {
 
      // Skip this file
      if(fileName === 'index.js' && directory === __dirname) return;
 
      // Skip unknown filetypes
      if(validFileTypes.indexOf(fileName.split('.').pop()) === -1) return;
 
      // Require the file.
      require(target)(app, stpath, bufferSize, bufferTimeLimit, db );
    }
  });
};
 
module.exports = function (app, stpath, bufferSize, bufferTimeLimit, db) {
  requireFiles(__dirname, app, stpath, bufferSize, bufferTimeLimit, db);
};