/* /public/javascripts/tracker.js
* 
* This file  blabla, one day ill write it....
*
*/

function supertracker() {

	var bufferSize = %bufferSize%; 
	var bufferTimeLimit = %bufferTimeLimit%; 
	// Session wide event data
	var sessionId, userId, trackId;
	var flushingLoop;
	var referrer;
	var date;


	function init () {
		// userId  = '%userId%';
		referrer = document.referrer;
		date = new Date();

        trackId = getCookie(supertrackerTrackId);
        console.log("trackId:");
        console.log(trackId);

		if (!localStorage.supertrackerTrackId) {
			trackId = uuid();
			document.cookie = "supertrackerTrackId="+trackId+";domain=.edmdesigner.com";
		} else {
			trackId = localStorage.supertrackerTrackId;
		}

		$.ajaxSetup({ cache: true });
		$.when(
			$.getScript( "http://js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js" )
		).done(function(){

			geoip2.city(function (resCity) {

				if (sessionStorage.supertrackerSessionId) {
					sessionId = sessionStorage.supertrackerSessionId;
					console.log('Sessionstorage on');
				 } else {
					console.log('Sessionstorage off');
					var session = {};
					session.track_id = trackId;
					session.date = date;
					session.screen_windowY = $(window).height();   // returns height of browser viewport
					session.screen_windowX = $(window).width();   // returns width of browser viewport
					session.screen_screenX = screen.width;
					session.screen_screenY = screen.height;

					
						// ttt errorkezeles

					session.location_ipAddress = resCity.traits.ip_address;
					session.location_country =  resCity.country.names.en;
					session.location_region =  resCity.subdivisions[0].names.en;
					session.location_city = resCity.city.names.en;
					
					$.ajax({
						url: '%path%/sessions',
						type: 'POST',
						contentType: 'application/json',
						data: JSON.stringify(session)
					})
					.done(function(res) {
						console.log(res);
						sessionStorage.supertrackerSessionId = res.sessionId;
						sessionId = res.sessionId;
					})
					.fail(function(err) {
						console.log("error");
						console.log(err);
					});
				}
			});
		});


		flushingLoop = setInterval(flush, bufferTimeLimit);
	}    

	function track(eventName, eventData, comment) {

		// Preparing data
		var event = {
			"track_id": trackId,
			"session_id": sessionId,
			"referrer": referrer,
			"name": eventName,
			"data": eventData,
			"date": new Date(),
			"comments": comment
		};

		//Loading localstorage
		if(typeof(Storage) !== "undefined") {
			var eventBuffer;

			if (localStorage.eventBuffer) {
				eventBuffer = JSON.parse(localStorage.eventBuffer);
				eventBuffer.push(event);
			} else {
				eventBuffer = [event];
			}

			localStorage.eventBuffer = JSON.stringify(eventBuffer);                

			if (eventBuffer.length >= bufferSize) {
				flush();
			}


		} else {
			console.log('Localstorage is not available...');
		}
	}

	function flush () {
		if(typeof(Storage) !== "undefined") {
			if (localStorage.eventBuffer) {
				$.ajax({
						url: '%path%/events',
						type: 'POST',
						contentType: 'application/json',
						data: JSON.stringify(JSON.parse(localStorage.eventBuffer))                
					})
				.done(function(data) {
					localStorage.removeItem('eventBuffer');
					clearInterval(flushingLoop);
					loop = setInterval(flush, bufferTimeLimit);
					$("#ajaxmessage").html(data);
				})
				.fail(function(data) {
					console.log("error");
					console.log(data);
					$("#ajaxmessage").html(data);
				});
			}
		} else {
			console.log('Localstorage is not available...');
		}
	}

	function identify(extUserId, extFlag) { //ttt flushing mechanism
		var user = {
			"track_id": trackId,
			"external_user_id": extUserId,
			"external_flag": extFlag
		};
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '%path%/users');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function() {
			if (xhr.status === 200) {
				var userInfo = JSON.parse(xhr.responseText);
				// console.log(userInfo);
			}
		};
		xhr.send(JSON.stringify(user));
	}

	function uuid() {

		// Random entropy
		function R() {
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16);
			// .substring(1);
		}

		// Date entropy
		function D() {
			return (1*new Date()).toString(16);
		}

		// User agent entropy
		function UA() {
		    var ua = navigator.userAgent, i, ch, buffer = [], ret = 0;

		    function xor(result, byte_array) {
		        var j, tmp = 0;
		        for (j = 0; j < byte_array.length; j++) {
		            tmp |= (buffer[j] << j*8);
		        }
		        return result ^ tmp;
		    }

		    for (i = 0; i < ua.length; i++) {
		        ch = ua.charCodeAt(i);
		        buffer.unshift(ch & 0xFF);
		        if (buffer.length >= 4) {
		            ret = xor(ret, buffer);
		            buffer = [];
		        }
		    }

		    if (buffer.length > 0) { ret = xor(ret, buffer); }

		    return ret.toString(16);
		}

		function S() {
			return (screen.height*screen.width).toString(16);
		}

		return (D()+"-"+R()+"-"+UA()+"-"+S());
	}

	function setCookie(cname, cvalue, exdays, cdomain) {
	    var d = new Date();
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+d.toUTCString();
	    var domain = "domain=" + cdomain;
	    document.cookie = cname + "=" + cvalue + "; " + expires + "; " + domain;
	}

	function getCookie(cname) {
	    var name = cname + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0; i<ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1);
	        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
	    }
	    return "";
	}

	return {
		init: init,
		track: track,
		identify: identify
	};
}


