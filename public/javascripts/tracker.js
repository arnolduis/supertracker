/*
* This file  blabla, one day ill write it....
*
*/

function supertracker() {

    var bufferSize = %bufferSize%; 
    var bufferTimeLimit = %bufferTimeLimit%; 
    // Session wide event data
    var sessionId;
    // Uniq event data
    var referrer;


    function init (_userId) {
        $.ajaxSetup({ cache: true});
        if (sessionStorage.supertrackerSessionId) {
            sessionId = sessionStorage.supertrackerSessionId;
         } else {
            var windowX, windowY, screenX, screenY;
            var country, region, city;
            var initialReferrer;

            windowY = $(window).height();   // returns height of browser viewport
            windowX = $(window).width();   // returns width of browser viewport
            screenX = screen.width;
            screenY = screen.height;
            
            $.getScript('//js.maxmind.com/js/geoip.js', function () {
                // ttt errorkezeles
                country = geoip_country_name();
                region = geoip_region_name();
                city = geoip_city();
            });
            console.log("tracler.js:");

            initialReferrer = document.referrer;

            $.ajax({
                url: '%path%/sessions',
                type: 'POST',
                dataType: 'json',
                data: {
                    userId: _userId,
                    windowX: windowX, 
                    windowY: windowY, 
                    screenX: screenX, 
                    screenY: screenY,
                    country: country, 
                    region: region, 
                    city: city,
                    initialReferrer: initialReferrer
                }
            })
            .done(function(res) {
                console.log("success");
                console.log(res);
            })
            .fail(function() {
                console.log("error");
            });
            
        }
        var loop = setInterval(flush, bufferTimeLimit);
    }    

    function track(eventName, eventData, comment) {

        // Preparing data
        var event = {
            "user_id": "dummyId",
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
                    clearInterval(loop);
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


// $.getScript('http://js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js', function () {
//     // ttt errorkezeles
//     geoip2.country(function (resCountry) {
//         console.log(resCountry);
//     });
// });