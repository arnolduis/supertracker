/*
* Depends on Jquery
*
*/
var userId = null;

function eventTracker(_userId) {
        
        var userId = userId || _userId;

        function track(eventName, eventData, comment) {

            $.ajax({
                url: '%=path%/track', //xxx
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                dataType: 'json',
                data: {
                    user_id: userId,
                    name: eventName,
                    data: eventData,
                    date: new Date(),
                    comments: comment
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