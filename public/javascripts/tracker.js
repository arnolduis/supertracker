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

        $.ajaxSetup({ cache: true });

        $.when(
            $.getScript( "%path%/javascripts/md5.min.js" ),
            $.getScript( "http://js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js" )
        ).done(function(){

            geoip2.city(function (resCity) {

                if (!localStorage.supertrackerTrackId) {
                    trackId = md5(date + resCity.city.names.en + Math.random());
                    localStorage.supertrackerTrackId = trackId;
                } else {
                    trackId = localStorage.supertrackerTrackId;
                }


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

    function createUser(extUserId, extFlag) { //ttt flushing mechanism
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

    return {
        track: track,
        init: init,
        createUser: createUser
    };
}


