// routes/dashboard.js
module.exports = function(app, stpath) {
	app.get(stpath, function (req,res) {
	  	res.render('../node_modules/supertracker/views/dashboard.ejs',{title: 'Dashboard', stpath: stpath}); //ttt ez retek eossz igy, kezdj vele valamit...
	});
};