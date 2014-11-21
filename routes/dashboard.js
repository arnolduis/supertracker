module.exports = function(stpath) {
	return function (req,res) {
	  	res.render('../node_modules/supertracker/views/dashboard.ejs',{title: 'Dashboard', stpath: stpath}); //ttt ez retek eossz igy, kezdj vele valamit...
	};	
};