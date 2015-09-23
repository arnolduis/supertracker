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
	var storage = checkStorage();
	var evBuffer = eventBuffer();

	// Init function
	function init () {
		// userId  = '%userId%';
		referrer = document.referrer;
		date = new Date();

        // Getting the current domain
        var arrDomain = document.domain.split(".");
        var domain = null;
        if (arrDomain.length === 1){
        	domain = null;
        } else {
        	domain = "." + arrDomain[arrDomain.length -2] + "." + arrDomain[arrDomain.length - 1];
        }

		if (storage) {
	    	trackId = getCookie("supertrackerTrackId");
		} else {
			trackId = null;			
		}

		if (trackId) {
			setCookie("supertrackerTrackId", trackId, 365, domain); //ttt actual domain
		} else {
			trackId = uuid();
			if (storage) {
				setCookie("supertrackerTrackId", trackId, 365, domain); //ttt actual domain
			}
		}

			if (storage && sessionStorage.supertrackerSessionId) {
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
						if (!storage) session.properties = { cookiesDisabled: true };
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
						        if (storage) {
									sessionStorage.supertrackerSessionId = res.sessionId;
						        }
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


			track_links(".track_footer");

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

			//Loading localstorage
			evBuffer.push(event);

			// Check if it is called as async
			if ( typeof arguments[arguments.length - 1] == "function") {
				flush(callback);
			} else {
				if (evBuffer.getLength() >= bufferSize) {
					flush();
				}
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
		if (evBuffer.getLength() > 0) {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', '%path%/events');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.onload = function() {
			    if (xhr.status === 200) {
			        var res = JSON.parse(xhr.responseText);
			        if (res.errorMessage) {
			        	alert(res.errorMessage);
					}
					clearInterval(flushingLoop);
					flushingLoop = setInterval(flush, bufferTimeLimit);
					if (typeof callback == "function") {
						callback();
					}
			    } else {
			    	console.log("event_flush_error");
			    }
			};
			xhr.send(JSON.stringify(evBuffer.pop()));
		} 
	}

	function identify(extUserId, extFlag, callback) { //ttt flushing mechanism

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

		extUserId = args.shift();
		if (args.length > 0)
			if (typeof args[0] !== "function") {
				extFlag = args.shift();
			} else {
				extFlag = null;
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

				console.log(userInfo);

				if (userInfo.userSaved) {
					if (typeof callback == "function") {
						callback();
						return;
					}
				}
				if (typeof callback == "function") {
					callback({err: "user couldnt be saved: " + userInfo});
					return;
				}
			}
		};
		xhr.send(JSON.stringify(user));
	}

	function track_links (query) {
		var links = document.querySelectorAll(query);
		var onclick = function() {
			document.supertracker.track_link(query, this); 
			return false;	
		};
		for (var i = 0; i < links.length; i++) {
			links[i].onclick = onclick;
			// links[i].setAttribute("onclick", "document.supertracker.track_link('"+ query +"', this); return false");
		}
	}

	function track_link(query, element) {
		var trackData = query + "_" + element.getAttribute("href");
		track( trackData, {link: true});
		flush();
		setTimeout(function () {
			window.location = element.getAttribute("href");
		},100);

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
		identify: identify,
		track_link: track_link,
		track_links: track_links
	};
}

function checkStorage() {
	var uid = new Date();
	var cookie, ls, ss;
	var lsResult, ssResult, cookieResult;
	try {
		// local
		(ls = window.localStorage).setItem(uid, uid);
		lsResult = ls.getItem(uid) == uid;
		ls.removeItem(uid);
		// session
		(ss = window.sessionStorage).setItem(uid, uid);
		ssResult = ss.getItem(uid) == uid;
		ss.removeItem(uid);
		// cookie
		cookie = (navigator.cookieEnabled)? true : false;
		if (typeof navigator.cookieEnabled=="undefined" && !cookieEnabled){ 
			document.cookie="testcookie";
			cookie = (document.cookie.indexOf("testcookie")!=-1)? true : false;
		}
		return ls && ss && lsResult && ssResult && cookie;
	} catch (exception) {}
}

function eventBuffer (storage) {
	var buffer = [];

	function push (event){
		if (storage) {
			if (localStorage.eventBuffer) {
				buffer = JSON.parse(localStorage.eventBuffer);
				buffer.push(event);
			} else {
				buffer = [event];
			}
			localStorage.eventBuffer = JSON.stringify(buffer);   
		} else {
			buffer.push(event);
		}
	}

	function pop () {
		if (storage) {
			if (localStorage.eventBuffer) {
				buffer = JSON.parse(localStorage.eventBuffer);
				localStorage.removeItem('eventBuffer');
			} else {
				buffer = [];
			}
		}

		var buff = buffer;
		buffer = [];
		return buff;
	}

	function get () {
		var buff;
		if (storage) {
			if (localStorage.eventBuffer) {
				buff = JSON.parse(localStorage.eventBuffer);
			} else {
				buff = [];
			}
		} else {
			buff = buffer;
		}
		return buff;
	}

	function getLength () {
		var length;
		if (storage) {
			length = JSON.parse(localStorage.eventBuffer).length;
		} else {
			length = buffer.length;
		}
		return length;
	}

	return {
		push: push,
		pop: pop,
		get: get,
		getLength: getLength,

		length: length
	};
}


