function auth(userlevel) {

	if(userlevel == 1) {
		console.log("Authenticated");
		return true;
	}
	console.log("Not authenticated");
	return false;
}

function fakju() {
	console.log("fakju im supertracker");
}

exports.auth = auth;
exports.fakju = fakju;