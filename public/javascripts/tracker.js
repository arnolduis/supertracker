/*
* This file  blabla, one day ill write it....
*
*/

function supertracker() {

    var bufferSize = %bufferSize%; 
    var bufferTimeLimit = %bufferTimeLimit%; 
    // userData
    var userId;
    var windowX, windowY, screenX, screenY;
    var country, region, city;
    var reverref, initialReferrer;

    var onsiteChecking = setInterval(function () {
        var date = new Date();
        date.setTime(+ date + (days * 300000)); //5 * 60 * 1000
           document.cookie = "supertrackerOn=; expires=" + date.toGMTString() + ";";
    }, 270000);

    var loop = setInterval(flush, bufferTimeLimit);

    function init (_userId) {
        userId = _userId;

        windowY = $(window).height();   // returns height of browser viewport
        windowX = $(window).width();   // returns width of browser viewport
        screenX = screen.width;
        screenY = screen.height;

        // $.getScript('http://js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js', function () {
        //     // ttt errorkezeles
        //     geoip2.country(function (resCountry) {
        //         console.log(resCountry);
        //     });
        // });
        
        $.getScript('http://j.maxmind.com/app/geoip.js', function () {
            // ttt errorkezeles
            country = geoip_country_name();
            region = geoip_region_name();
            city = geoip_city();
        });

        initialReferrer = document.referrer;
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