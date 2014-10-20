/*
* Depends on Jquery
*
*/
var userId = null;

function eventTracker(_userId) {

    var userId = userId || _userId;

    function track(eventName, eventData, comment) {

        var bufferSize = 2; 
        // var bufferTimeLimit = 10; 
        // var bufferTime = 0; 

        // Preparing data
        var event = {
            "user_id": userId,
            "name": eventName,
            "data": eventData,
            "date": new Date(),
            "comments": comment
        };

        // Handling localstorage
        if(typeof(Storage) !== "undefined") {

            var eventBuffer;

            // preparing eventbuffer
            if (localStorage.eventBuffer) {

                eventBuffer = JSON.parse(localStorage.eventBuffer);
                eventBuffer.push(event);

            } else {

                eventBuffer = [event];
            }

            // sending
            if (eventBuffer.length >= bufferSize) {

                // Sending data
                $.ajax({
                        url: '%=path%/track', //xxx
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(eventBuffer)
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


                // empty localbuffer
                localStorage.removeItem('eventBuffer');

            } else {
                localStorage.eventBuffer = JSON.stringify(eventBuffer);                
            }

        } else {
            console.log('Localstorage is not available...');
        }




    }

    return {
        track: track
    };
}

// if (typeof require === "function" && typeof require.specified === "function" && require.specified("jquery")) {
//     define(["jquery"], function () {
//         return EDMUtils;
//     });
// } else {
//     $(document).ready(function() {
//         var edmUtils = EDMUtils();
//     });
// }