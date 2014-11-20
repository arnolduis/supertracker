/* /public/javascripts/tracker.js
* 
* This file  blabla, one day ill write it....
*
*/

function supertracker() {

    var bufferSize = %bufferSize%; 
    var bufferTimeLimit = %bufferTimeLimit%; 
    // Session wide event data
    var sessionId, userId;
    var flushingLoop;
    var referrer;
    var date;


    function init () {
        userId  = '%userId%';
        referrer = document.referrer;
        date = new Date();


        if (sessionStorage.supertrackerSessionId) {
            sessionId = sessionStorage.supertrackerSessionId;
            console.log('Sessionstorage on');
         } else {
            console.log('Sessionstorage off');
            var session = {userId: userId, date: date, screen: {}, location: {}};
            // var windowX, windowY, screenX, screenY;
            // var ipAddress, country, region, city;

            session.screen.windowY = $(window).height();   // returns height of browser viewport
            session.screen.windowX = $(window).width();   // returns width of browser viewport
            session.screen.screenX = screen.width;
            session.screen.screenY = screen.height;
            
            $.ajaxSetup({ cache: true });
            $.getScript('http://js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js', function () {
                // ttt errorkezeles
                geoip2.city(function (resCity) {

                    session.location.ipAddress = resCity.traits.ip_address;
                    session.location.country =  resCity.country.names.en;
                    session.location.region =  resCity.subdivisions[0].names.en;
                    session.location.city = resCity.city.names.en;

                    $.ajax({
                        url: '%path%/sessions',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(session)
                    })
                    .done(function(res) {
                        console.log(res.sessionId);
                        sessionStorage.supertrackerSessionId = res.sessionId;
                        sessionId = res.sessionId;
                    })
                    .fail(function(err) {
                        console.log("error");
                        console.log(err);
                    });
                });
            },
            function(err) {
                console.log(err);
            });
        }

        flushingLoop = setInterval(flush, bufferTimeLimit);
    }    

    function track(eventName, eventData, comment) {

        // Preparing data
        var event = {
            "userId": userId,
            "sessionId": sessionId,
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
                        url: '%path%/track',
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

    return {
        track: track,
        init: init
    };
}


