module.exports = function (app, stpath) {
  app.get(stpath+'/user', function (req, res) {
    // Controller logic
    res.send('Test mukodott');
  });
};