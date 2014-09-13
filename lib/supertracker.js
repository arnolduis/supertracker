function auth(userlevel) {

	if(userlevel == 1) {
		console.log("true");
		return true;
	}
	console.log("false");
	return false;
}

function fakju() {
	console.log("fakju im supertracker");
}

exports.auth = auth;
exports.fakju = fakju;