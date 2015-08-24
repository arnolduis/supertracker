  // routes/index.js
var fs = require('fs'),
    validFileTypes = ['js'];
var path = require('path');

 
var requireFiles = function (directory, app, options) {
  fs.readdirSync(directory).forEach(function (fileName) {
    // Recurse if directory
    var target = path.join(directory, fileName);

    if(fs.lstatSync(target).isDirectory()) {
      requireFiles(target, app, options);
    } else {
 
      // Skip this file
      if(fileName === 'index.js' && directory === __dirname) return;
 
      // Skip unknown filetypes
      var validFileTypes = ["js"];
      if(validFileTypes.indexOf(fileName.split('.').pop()) === -1) return;
 
      // Require the file.
      require(target)(app, options);
    }
  });
};
 
module.exports = function (app, options) {
  requireFiles(__dirname, app, options);
};