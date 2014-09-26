
$.ajax({
	url: window.location+'ajax',
	type: 'GET',
	dataType: 'json',
	data: {
		message: 'message form client'
	}
})
.done(function(data) {
	console.log('success');
	console.log(data);
	$("#ajaxmessage").html(data.response);
})
.fail(function(data) {
	console.log("error");
	console.log(data);
	$("#ajaxmessage").html(data);
})
.always(function() {
// console.log('Contacts obtained!!');
});