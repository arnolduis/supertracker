/*
* This file  blabla, one day ill write it....
*
*/

function supertracker() {

    var bufferSize = %bufferSize%; 
    var bufferTimeLimit = %bufferTimeLimit%; 

    var loop = setInterval(flush, bufferTimeLimit);

    

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
        track: track
    };
}