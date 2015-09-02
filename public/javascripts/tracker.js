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
	var initiated = false;


	function init () {
		// userId  = '%userId%';
		referrer = document.referrer;
		date = new Date();

        trackId = getCookie("supertrackerTrackId");

        // Getting the current domain
        var arrDomain = document.domain.split(".");
        var domain = null;
        if (arrDomain.length === 1){
        	domain = null;
        } else {
        	domain = "." + arrDomain[arrDomain.length] + "." + arrDomain[arrDomain.length - 1];
        }
		// console.log("ST: domain: " + domain); // xxx


		if (trackId) {
			setCookie("supertrackerTrackId", trackId, 365, domain); //ttt actual domain
		} else {
			trackId = uuid();
			setCookie("supertrackerTrackId", trackId, 365, domain); //ttt actual domain
		}
		// console.log("ST: trackId:" + trackId); //xxx



			if (sessionStorage.supertrackerSessionId) {
				sessionId = sessionStorage.supertrackerSessionId;
				// console.log('Sessionstorage on');
				initiated = true;
				onInit();
			 } else {
				// getScript("%path%/javascripts/geoip2.js", function(){
					// geoip2.city(function (resCity) {
						
						// console.log('Sessionstorage off');
						var session = {};
						session.track_id = trackId;
						session.date = date;
						session.screen_windowX = window.innerWidth;   // returns width of browser viewport
						session.screen_windowY = window.innerHeight;   // returns height of browser viewport
						session.screen_screenX = screen.width;
						session.screen_screenY = screen.height;

						
							// ttt errorkezeles

						// session.location_ip = resCity.traits.ip_address;
						// session.location_country =  resCity.country.names.en;
						// session.location_region =  resCity.subdivisions[0].names.en;
						// session.location_city = resCity.city.names.en;


						var xhr = new XMLHttpRequest();
						xhr.open('POST', '%path%/sessions');
						xhr.setRequestHeader('Content-Type', 'application/json');
						xhr.onload = function() {
						    if (xhr.status === 200) {
						        var res = JSON.parse(xhr.responseText);
								// console.log("ST: sessions_response:"); //xxx
								// console.log(res); //xxx
								sessionStorage.supertrackerSessionId = res.sessionId;
								sessionId = res.sessionId;

						        if (res.errorMessage) {
						        	alert(res.errorMessage);
						        }
						        initiated = true;
								onInit();
						    } else {
						    	console.log("session_post_error");
						    }
						};
						xhr.send(JSON.stringify(session));

					// });
				// });
			}
			flushingLoop = setInterval(flush, bufferTimeLimit);
	}

	function onInit () {
		
	}

	function track(eventName, properties, comment, callback) {
		// console.log("TRACK:");
		// console.log(arguments);
		// console.log("{");
		// console.log("eventName: " + eventName);
		// console.log("properties: " + properties);
		// console.log("comment: " + comment);
		// console.log("callback: " + callback);

		var args = [];
		for (var i = 0; i < arguments.length; i++) {
		    args.push(arguments[i]);
		} 

		eventName = args.shift();
		if (args.length > 0)
			if (typeof args[0] !== "function") {
				properties = args.shift();
			} else {
				properties = null;
				comment = null;
				callback = args.shift();
				args.length = 0;
			}
		if (args.length > 0)
			if (typeof args[0] !== "function") {
				comment = args.shift();
			} else {
				comment = null;
				callback = args.shift();
				args.length = 0;
			}
		if (args.length > 0) {
			if (typeof args[0] !== "function") {
				// comment = args.shift();
			} else {
				callback = args.shift();
			}
		}
		// console.log("XXXX");
		// console.log("eventName: " + eventName);
		// console.log("properties: " + properties);
		// console.log("comment: " + comment);
		// console.log("callback: " + callback);
		// console.log("}");


		if (initiated) {
			// Preparing data
			var event = {
				"track_id": trackId,
				"session_id": sessionId,
				"name": eventName,
				"referrer": referrer,
				"current_url": window.location.href,
				"properties": properties,
				"date": new Date(),
				"comments": comment
			};
			// console.log(event); //xxx

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

				// Check if it is called as async
				if ( typeof arguments[arguments.length - 1] == "function") {
					flush(callback);
				} else {
					if (eventBuffer.length >= bufferSize) {
						flush();
					}
				}




			} else {
				console.log('Localstorage is not available...');
			}
		} else {
			var origOnInit = onInit;
			onInit = function () {
				origOnInit();
				track(eventName, properties, comment, callback);
			};
		}
	}

	function flush (callback) {
		if(typeof(Storage) !== "undefined") {
			if (localStorage.eventBuffer) {

				var xhr = new XMLHttpRequest();
				xhr.open('POST', '%path%/events');
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.onload = function() {
				    if (xhr.status === 200) {
				        var res = JSON.parse(xhr.responseText);
				        if (res.errorMessage) {
				        	alert(res.errorMessage);
						}
						// console.log(res); //xxx
						localStorage.removeItem('eventBuffer');
						clearInterval(flushingLoop);
						flushingLoop = setInterval(flush, bufferTimeLimit);

						if (typeof callback == "function") {
							callback();
						}

				    } else {
				    	console.log("event_flush_error");
				    }
				};
				xhr.send(JSON.stringify(JSON.parse(localStorage.eventBuffer)));
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
				console.log(xhr.responseText);
				var userInfo = JSON.parse(xhr.responseText);
				console.log("ST USER SAVED:");
				console.log(userInfo);
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
	    var strCookie = cname + "=" + cvalue + "; " + expires + "; ";
	    if (cdomain) {
	    	strCookie = strCookie + domain;
	    }
	    document.cookie = strCookie;
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

	// function getScript(source, callback) {
	//     var script = document.createElement('script');
	//     var prior = document.getElementsByTagName('script')[0];
	//     script.async = 1;
	//     prior.parentNode.insertBefore(script, prior);

	//     script.onload = script.onreadystatechange = function( _, isAbort ) {
	//         if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
	//             script.onload = script.onreadystatechange = null;
	//             script = undefined;

	//             if(!isAbort) { if(callback) callback(); }
	//         }
	//     };

	//     script.src = source;
	// }

	return {
		init: init,
		track: track,
		identify: identify
	};
}


