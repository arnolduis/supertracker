$(document).ready(function() {
    // Overall viewmodel for this screen, along with initial state


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////       DASHBOARDVM:JS        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function dashboardVM(_userId) {  


        var userId = _userId;
                                    //////////////////////////////////////////////////////////////////////////////////////
                                    /******************************** FUNNEL ANALYSIS  **********************************/

        // Funnels
        var serverFunnels = %funnels%;

        var funnels = ko.observableArray();
        var funnelEdited = ko.observable();
        var funnelSelected = ko.observable();
        
        funnelSelected.subscribe(function () {
            if (funnelSelected()) {
                funnelEdited(funnelVM(funnelSelected().toJson())); //ttt itten ez nagyon csuny a deletefunnellel egyutt. Nezd meg, hogy lehet e mashogyh megoldani, ha a selected elemet dropoljuk
            }
        });

        // Fill up funnels with serverFunnels or with dummy data
        if (serverFunnels.length > 0) {
            for (var i = 0; i < serverFunnels.length; i++) {
                funnels.push(funnelVM(serverFunnels[i].funnel));
            }
            funnels.sort(function(left, right) { 
                return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1); 
            });
        } else {
            var now = new Date();
            funnels.push(funnelVM({
                name: 'Dummy',
                dateFrom: new Date(), 
                dateTo:   new Date(), 
                options: {
                    exact: false,
                    userwise: false,
                    newUsers: false,
                    longestFunnel: false,
                    linearFunnel: false
                },
                steps:[stepVM().toJson()]
            }));
        }

        funnelSelected(funnels()[0]);




        var funnelChart = chartVM();


        applyFunnel();
        
        function addFunnel() {
            funnel(funnelVM());
        }

        function saveFunnel () {
            console.log('Saving funnel');

            var funnelToBeSentString = JSON.stringify({userId: userId, funnel: funnelEdited().toJson()});

            $.ajax({
                url: '%path%/funnels',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: funnelToBeSentString
            })
            .done(function(res) {
                console.log('Server response: '+ res.response);
                var update = indexOfFunnel(funnels, funnelEdited);
                if (update + 1) {
                    funnels()[update] = funnelVM(funnelEdited().toJson());
                } else{
                    //ttt itt meg kell csinalni, ha minden elemet torolnek
                    for (var i = 0; i < funnels().length; i++) {
                        if (funnels()[i].name() < funnelEdited().name()) {
                        } else{
                            var tfunnels = [];
                            for (var j = 0; j < funnels().length; j++) {
                                tfunnels.push(funnelVM(funnels()[j].toJson()));
                            }
                            var bfunnels = tfunnels.splice(0,i);
                            bfunnels.push(funnelEdited());
                            bfunnels = bfunnels.concat(tfunnels.splice(0,tfunnels.length));
                            funnels(bfunnels);//nnn jaj de finesszes
                            return;
                        } 
                    }
                    funnels.push(funnelVM(funnelEdited().toJson()));
                }
            })
            .fail(function(err) {
                console.log("error");
                console.log(err);
            });
        }

        function deleteFunnel () {
            var funnelIndex = indexOfFunnel(funnels, funnelEdited);
            console.log('%path%/funnels/'+userId+'/'+funnels()[funnelIndex].name());
            if (funnelIndex + 1) {
                $.ajax({
                    url: '%path%/funnels/'+userId+'/'+funnels()[funnelIndex].name(),
                    type: 'DELETE'
                })
                .done(function(res) {
                    console.log("deleteFunnel() success");
                    console.log(res);
                    funnels.splice(funnelIndex,1);//qqq itt lehet mast hasznalni?


                    if (funnels().length > 0) {
                        funnelSelected(funnels()[0]);
                    } else{
                        var now = new Date();
                        funnels.push(funnelVM({
                            name: 'Dummy',
                            dateFrom: new Date(), 
                            dateTo:   new Date(), 
                            options: {
                                exact: false,
                                userwise: false,
                                newUsers: false,
                                longestFunnel: false,
                                linearFunnel: false
                            },
                            steps:[stepVM().toJson()]
                        }));
                    }
                })
                .fail(function(res) {
                    console.log("deleteFunnel() error");
                    console.log(res);
                });
                
            } else{
                // if (funnels().length > 0) {
                //     funnelSelected() = 
                // } else{};
                // console.log('nincs ilyen funnel');
            }
        }

        function applyFunnel () {
            
            var funnelEditedJSON = funnelEdited().toJson();

            var funnelToBeSentString = JSON.stringify({userId: userId, funnel: funnelEditedJSON});
            // console.log(funnelEditedJSON);
            $.ajax({
                url: '%path%/funnels/apply',
                type: 'POST',
                contentType: 'application/json',
                data: funnelToBeSentString
            })
            .done(function(res) {
                // console.log("success");
                // console.log(res);
                funnelChart.data.labels = [];
                for (var i = 0; i < res.length; i++) {
                    funnelChart.data.labels.push(funnelEditedJSON.steps[i].event);
                }
                funnelChart.data.datasets[0].data = res;

                //ttt update function undefined
                $('#funnelCanvas').replaceWith('<canvas id="funnelCanvas" width="680" height="300"></canvas>');


                 // Draw the chart
                funnelChart.ctx = $('#funnelCanvas').get(0).getContext("2d");
                funnelChart.funnelChart = new Chart(funnelChart.ctx);
                funnelChart.funnelChart.Bar(funnelChart.data);    
            })
            .fail(function() {
                console.log("error");
            });
            
        }

        function indexOfFunnel (funnelObsArray, funnelObs) {
            for (var i = 0; i < funnelObsArray().length; i++) {
                if (funnelObsArray()[i].name() == funnelObs().name()) {
                    return i;
                }
            }
            return -1;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /****************************************** USERPATH ANALYSIS  ********************************************/
        var userPath = userPathVM();


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /******************************************* COHORT ANALYSIS  *********************************************/

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /****************************************  SEGMENTATION ANALYSIS  *****************************************/

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /****************************************  UTILITY FUNCTIONS  *********************************************/
        function plusXDay(date, x){
            var newday = new Date(date.toISOString());
            newday.setDate(date.getDate() + x);
            return newday;
        }

        function plusXMonth(date, x){
            var newday = new Date(date.toISOString());
            newday.setMonth(date.getMonth() + x);
            return newday;
        }


        return {
            // Funnel
            funnels: funnels,
            funnelSelected: funnelSelected,
            funnelEdited: funnelEdited,
            applyFunnel: applyFunnel,
            // userId: userId,
            // // methods
            addFunnel: addFunnel,
            saveFunnel: saveFunnel,
            deleteFunnel: deleteFunnel,
            // UserPath
            userPath: userPath,
            // // Cohort
            // retentionMX: retentionMX,
            // cohRows: cohRows,
            // cohCols: cohCols,
            // applyCohort: applyCohort,
            // setSensCohort: setSensCohort,
            // // Segmentation
            // events: events, //ttt valamit at kell itt gondolni
            // segEvent: segEvent,
            // segGrpBy: segGrpBy,
            // segTimeInt: segTimeInt,
            // properties: properties,
            // intervals: intervals,
            // applySegQuery: applySegQuery,
            // segCondition: segCondition
        };
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////       USERPATHVM:JS        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function userPathVM (userPathJson) {
        var userPaths = ko.observableArray();

        function show () {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '%path%/userPaths');
            xhr.send(null);
            xhr.onreadystatechange = function () {
                var DONE = 4; // readyState 4 means the request is done.
                var OK = 200; // status 200 is a successful return.
                    if (xhr.status === OK) {
                        // console.log("response:", JSON.parse(xhr.responseText)); // 'This is the returned text.'
                        // console.log("response:", xhr.responseText); // 'This is the returned text.'
                        // console.log(JSON.parse(xhr.responseText));
                        userPaths(JSON.parse(xhr.responseText));
                    } else {
                        console.log('Error: ' + xhr.status); // An error occurred during the request.
                    }
            };
        }


        // userPaths([
        //     {
        //         name: "gyula@mittomenmi",
        //         sessions: [
        //             {
        //                 name:"session1",
        //                 events: ["1", "2", "3"]
        //             },
        //             {
        //                 name: "session2",
        //                 events: ["1", "2", "3"]
        //             }
        //         ]
        //     }
        // ]);

        return {
            userPaths: userPaths,
            show: show
        };
    }





    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////       FUNNELVM:JS        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function funnelVM (funnelJson) {

        var now = new Date();
        var name  = ko.observable();
        var steps = ko.observableArray([]);
        var exact = ko.observable(false);
        var userwise = ko.observable(false);
        var newUsers = ko.observable(false);
        var longestFunnel = ko.observable(false);
        var linearFunnel = ko.observable(false);
        var sessionProperties = ko.observable("{}");
        var dateFromDate = ko.observable(new Date());
        var dateToDate = ko.observable(new Date());
        var dateFromTime = ko.observable(now.toISOString().split("T")[1].split(".")[0]);
        var dateToTime   = ko.observable(now.toISOString().split("T")[1].split(".")[0]);
        var dateFrom = ko.computed(function () {
            var _timeFrom = dateFromTime();
            var _dateFromDate = dateFromDate();

            if (!validateTime(_timeFrom)) {
                return console.log("Time is not valid. Provide it in a HH:MM:ss, or H:M:s  format");
            } 
            return new Date(_dateFromDate.toISOString().split("T")[0]+"T"+_timeFrom);
        });
        var dateTo = ko.computed(function () {
            var _dateToTime = dateToTime();
            var _dateToDate = dateToDate();
            if (!validateTime(_dateToTime)) {
                return console.log("Time is not valid. Provide it in a HH:MM:ss, or H:M:s  format");
            } 
            return new Date(_dateToDate.toISOString().split("T")[0]+"T"+_dateToTime);
        });

        // Init
        var tmpDateFrom;
        var tmpDateTo;

        if (funnelJson) {

            name(funnelJson.name);
            sessionProperties(funnelJson.sessionProperties || "{}");
            exact(funnelJson.options.exact);
            userwise(funnelJson.options.userwise);
            newUsers(funnelJson.options.newUsers);
            longestFunnel(funnelJson.options.longestFunnel);
            linearFunnel(funnelJson.options.linearFunnel);

            for (var i = 0; i < funnelJson.steps.length; i++) {
                steps.push(stepVM(funnelJson.steps[i]));
            }

            dateFromDate(new Date(ko.unwrap(funnelJson.dateFrom)));
            dateToDate(new Date(ko.unwrap(funnelJson.dateTo)));

            dateFromTime(new Date(funnelJson.dateFrom).toISOString().split("T")[1].split(".")[0]);
            dateToTime(new Date(funnelJson.dateTo).toISOString().split("T")[1].split(".")[0]);

        } else {

            name = "";
            steps.push(stepVM());
        }

        (function() {
            var customName = "funnel";
            var calendars = {};
            var calendarsId = 0;

            ko.bindingHandlers.dhtmlXCalendar = {
                init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var value = valueAccessor();
                    console.log(value);
                    element.setAttribute("data-calendarsId", calendarsId);
                    element.id = customName + "Calendar_" + calendarsId;
                    calendars[calendarsId] =  new dhtmlXCalendarObject(element.id);
                    calendars[calendarsId].hideTime();
                    calendars[calendarsId].setDate(value.value());
                    element.value = calendars[calendarsId].getDate().toISOString().split("T")[0]; // ttt redundant
                    calendars[calendarsId].attachEvent("onClick", function(date, state){
                        console.log("xxx", date, state);
                        value.value(calendars[element.dataset.calendarsid].getDate());
                    });

                    calendarsId++;
                },
                update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var value = valueAccessor();

                    var calendarsId = element.dataset.calendarsid;

                    calendars[calendarsId].setSensitiveRange(value.min && value.min().toISOString().split("T")[0], value.max && value.max().toISOString().split("T")[0]);
                    calendars[calendarsId].setDate(value.value().toISOString().split("T")[0]);
                }
            };
        }());


        function addStep() {
            steps.push(stepVM());
        }


        function removeStep (step) {
            //ttt nem mukodik
            console.log('removeStep');
            steps.remove(step);
        }

        function toJson () {
            var funnelJson = {
                name: name(), 
                dateFrom: dateFrom(), 
                dateTo: dateTo(),
                sessionProperties: sessionProperties(),
                steps: [],
                options: {
                    exact: exact(),
                    userwise: userwise(),
                    newUsers: newUsers(),
                    longestFunnel: longestFunnel(),
                    linearFunnel: linearFunnel()
                }
            };
            for (var i = 0; i < steps().length; i++) {
                funnelJson.steps.push(steps()[i].toJson());
            }
            return  funnelJson;
        }


        function getDates() {
            return [$("#funnel_date_from").val(), $("#funnel_date_to").val()];
        }

        function setSens(id, k) {
            // update range
            if (k == "min") {
                funnelCalendar.setSensitiveRange($("#funnel_date_from").val(), null);
            } else {
                funnelCalendar.setSensitiveRange(null, $("#funnel_date_to").val());
            }
        }

        function validateTime (time) {
            if(time) {
                res = time.match(/([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5]?[0-9]:[0-5]?[0-9]/g);
                if (!res) {
                    console.log("From time is invalid, ples check if it is in a HH:MM:SS format.");
                    return false; 
                } 
            } 
            return true;
        }     



        return {
            name: name,
            steps: steps,
            dateFrom: dateFrom,
            dateTo: dateTo,
            dateFromDate: dateFromDate,
            dateToDate: dateToDate,
            dateFromTime: dateFromTime,
            dateToTime: dateToTime,
            sessionProperties: sessionProperties,
            exact: exact,
            userwise: userwise,
            newUsers: newUsers,
            longestFunnel: longestFunnel,
            linearFunnel: linearFunnel,

            addStep: addStep,
            removeStep: removeStep,
            toJson: toJson,
            setSens: setSens,
            getDates: getDates
        };
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////       STEPVM:JS        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function stepVM (stepJson) {
        var events = %events%;
        var customProps = __properties__;
        for (var i = 0; i < customProps.length; i++) {
            customProps[i] = customProps[i].charAt(0).toUpperCase() + customProps[i].slice(1);
        }
        var properties = ['','Browser','City','Country','Initial Referrer','Initial referring domain','Operating System', 'Referrer','Region','Screen Height','Screen Width'];
        properties = properties.concat(customProps);
        var operation_types = [
            { name: 'Happened', operators: [

            ]},
            { name: 'String', operators: [
                { name: 'equals'       ,value: '=' },
                { name: 'not equals'   ,value: '!=' },
                { name: 'contains'     ,value: 'in' },
                { name: 'not contains' ,value: '!in' },
                { name: 'is set'       ,value: 'is setXXX' },
                { name: 'not set'      ,value: 'not setXXX' }
            ]},
            { name: 'Number', operators: [
                { name: 'in between'    ,value: 'in between XXX' },
                { name: 'less than'     ,value: '<' },
                { name: 'equal to'      ,value: '=' },
                { name: 'greater than'  ,value: '>' }
            ]},
            { name: 'True/False', operators: [
                { name: 'is'            ,value: '=' }
            ]},
            { name: 'Date', operators: [
                { name: 'was XXX'       ,value: '<' }// tobb lepeses valasztas
            ]}, 
                { name: 'List', operators: [
                    { name: 'contains'      ,value: 'containtX' }
                ]}
        ];

        var operation_type = stepJson ? ko.observable(stepJson.operation_type) : ko.observable(operation_types[0]); // default needed becouse of the order of elements
        var event          = stepJson ? ko.observable(stepJson.event)          : ko.observable();
        var property       = stepJson ? ko.observable(stepJson.property)       : ko.observable();
        var operator       = stepJson ? ko.observable(stepJson.operator)       : ko.observable();
        var value          = stepJson ? ko.observable(stepJson.value)          : ko.observable("");

        function toJson () {
            return {
                operation_type: operation_type(),
                event: event(),
                property: property(),
                operator: operator(),
                value: value()
            };
        }

        return {
            events: events,
            properties: properties,
            operation_type: operation_type,
            operation_types: operation_types,
            
            event: event,
            property: property,
            operator: operator,
            value: value,
            //method
            toJson: toJson
        };
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////       RETENTIONVM:JS        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // function retentionPanelVM () {
    //     var cohRows = ko.observable(5);
    //     var cohCols = ko.observable(12);
    //     var retentionMX = ko.observableArray(); 

    //     // initialize
    //     var tmp = [];
    //     // for (var i = 0; i < cohRows(); i++) {
    //     //     tmp.push([]);
    //     //     for (var j = 0; j < cohCols(); j++) {
    //     //         tmp[i][j] = "Nuni";
    //     //     }
    //     // }
    //     retentionMX(tmp);

    //     // Calendar
    //     var cohortCalendar = new dhtmlXCalendarObject(["cohort_date_from","cohort_date_to"]);
    //     cohortCalendar.setWeekStartDay(1);
    //     cohortCalendar.setDate(tstr);
    //     cohortCalendar.hideTime();
    //     $("#cohort_date_from").val("2014-01-01");
    //     $("#cohort_date_to").val("2014-01-08");
        
    //     // Initial value
    //     applyCohort();


    //     function setSensCohort(id, k) {
    //         // update range
    //         if (k == "min") {
    //             cohortCalendar.setSensitiveRange($("#cohort_date_from").val(), null);
    //         } else {
    //             cohortCalendar.setSensitiveRange(null, $("#cohort_date_to").val());
    //         }
    //     }

    //     function applyCohort() {
    //         var data = {};
    //         data.cols = cohCols();
    //         data.rows = cohRows();
    //         data.cohort_from = $("#cohort_date_from").val();
    //         data.cohort_to   = $("#cohort_date_to").val();
    //         data.cohortEvent = "Subscribe";
    //         data.returnEvent = "sessionStart";


    //         $.ajax({
    //             url: '%path%/cohort/getRetentionMatrix',
    //             type: 'POST',
    //             contentType: 'application/json',
    //             data: JSON.stringify(data)
    //         })
    //         .done(function(res) {
    //             console.log("success");
    //             for (var i = 0; i < res.length; i++) {
    //                 for (var j = 1; j < res[i].length; j++) {
    //                     res[i][j] = Math.round(res[i][j] / res[i][0] * 100) + "%";
    //                 }
    //             }
    //             retentionMX(res);
        
    //         })
    //         .fail(function() {
    //             console.log("error");
    //         });
    //     }
    // }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////       RETENTIONVM:JS        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // function segmentationPanelVM () {
    //     var events = %events%;
    //           var properties = ['','Browser','City','Country','Initial Referrer','Initial referring domain','Operating System', 'Referrer','Region','Screen Height','Screen Width'];
    //           var intervals = ['30 days','24 weeks','12 months'];
    //           var segCondition = ko.observable({});

    //           var segFrom = null; //ttt custom binding
    //           var segTimeInt = ko.observable(); // hour, day, week month
    //           var segEvent = ko.observable(); // one event
    //           var segGrpBy = ko.observable(); // one property
    //           var segData = {}; // filling up the chart

    //           // var segCond =  {
    //           //     "$or": [{
    //           //             "sessionId": "lolo"
    //           //         }, {
    //           //             "sessionId": "lolo"
    //           //     }]
    //           // };



    //           // Calendar
    //           var segCalendar = new dhtmlXCalendarObject("segFrom");
    //           $("#segFrom").val("2014-01-01");


    //           // Chart
    //           function applySegQuery() {
    //               segFrom = new Date($('#segFrom').val() + 'T00:00:00Z');
    //               var xLabels = [];
                  
    //               switch (segTimeInt()) {
    //                   case '30 days':
    //                       segTo = plusXDay(segFrom, 30);
    //                       for (var i = 0; i < 30; i++) {
    //                           xLabels[i] = plusXDay(segFrom, i).format('mm-dd') ;
    //                       }
    //                       break; 
    //                   case '24 weeks':
    //                       segTo = plusXDay(segFrom, 168);
    //                       for (var i = 0; i < 24; i++) {
    //                           xLabels[i] = plusXDay(segFrom, i * 7).format('mm-dd') ;
    //                       }

    //                       // while(iDate.gerDay() == 0) {
    //                       //     iDate.setDate(iDate.getDate() - 1);
    //                       // }
    //                       break; 
    //                   case '12 months':
    //                       segTo = plusXMonth(segFrom, 12);
    //                       for (var i = 0; i < 12; i++) {
    //                           xLabels[i] = plusXMonth(segFrom, i * 1).format('mm-dd') ;
    //                       }
    //                       break; 
    //                   default: 
    //                       segTo = plusXDay(segFrom, 30);
    //                       for (var i = 0; i < 30; i++) {
    //                           xLabels[i] = plusXDay(segFrom, i).format('mm-dd') ;
    //                   }
    //               }

    //               var data = {
    //                   segFrom: segFrom,
    //                   segTimeInt: segTimeInt(),
    //                   segEvent: segEvent(),
    //                   segGrpBy: segGrpBy(),

    //               };

    //               $.ajax({
    //                   url: '%path%/segmentation/apply',
    //                   type: 'POST',
    //                   contentType: 'application/json',
    //                   data: JSON.stringify(data)
    //               })
    //               .done(function(res) {
    //                   console.log("success");

    //                   $('#segCanvas').replaceWith('<canvas id="segCanvas" width="680" height="300"></canvas>');
    //                   var segCtx = document.getElementById("segCanvas").getContext("2d");
    //                   var segOptions = {
    //                       multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>",
    //                       legendTemplate : '<ul>' /
    //                                         +'<% for (var i=0; i<datasets.length; i++) { %>'  /
    //                                           +'<li>' /
    //                                           +'<span style=\"background-color:<%=datasets[i].lineColor%>\"></span>'  /
    //                                           +'<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>'    /
    //                                         +'</li>'  /
    //                                       +'<% } %>'  /
    //                                     +'</ul>'  
    //                       };
    //                   if (res.length === 0) {
    //                       segCtx.font="40px Georgia"; //ttt
    //                       segCtx.fillText("Fosi az adat, maki!",10,50);
    //                       var  segData = {
    //                           labels: xLabels,
    //                           datasets: []
    //                       };
    //                   } else {
    //                       var segData = fillsegData(res, xLabels);
    //                       var segChart = new Chart(segCtx).Line(segData, segOptions); 
    //                   }
    //               })
    //               .fail(function() {
    //                   console.log("error");
    //               });
    //           }


    //           function fillsegData (res, xLabels) {
    //               var segData = {
    //                   labels: xLabels,
    //                   datasets: []
    //               };


    //               for (var i = 0; i < res.length; i++) {
    //                   var datasetSchema = {
    //                       label: '',
    //                       fillColor: ",0.2)",
    //                       strokeColor: ",1)",
    //                       pointColor: ",1)",
    //                       pointStrokeColor: "#fff",
    //                       pointHighlightFill: "#fff",
    //                       pointHighlightStroke: ",1)",
    //                       data: []
    //                   };
    //                   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255);

    //                   datasetSchema.label = res[i].grpBy;
    //                   datasetSchema.fillColor = color + datasetSchema.fillColor;
    //                   datasetSchema.strokeColor = color + datasetSchema.strokeColor;
    //                   datasetSchema.pointColor = color + datasetSchema.pointColor;
    //                   datasetSchema.pointHighlightStroke = color + datasetSchema.pointHighlightStroke;
    //                   datasetSchema.data = res[i].data;
    //                   segData.datasets.push(datasetSchema);
    //               }
    //               return segData;
    //           }
    // }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////       CHARTVM:JS        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function chartVM () {
        // Chart.defaults.global.responsive = true;
        var data = {
            labels: ["Dummy"],
            datasets: [
                {
                    label: "Funneel",
                    fillColor: "rgba(0,0,220,0.7)",
                    strokeColor: "rgba(220,220,220,0.8)",
                    highlightFill: "rgba(220,220,220,0.75)",
                    highlightStroke: "rgba(220,220,220,1)",
                    data: [1]
                }
            ]
        };
        var funnelCtx = $("#funnelCanvas").get(0).getContext("2d");
        var funnelChart = new Chart(funnelCtx).Bar(data);

        return {
            funnelCtx: funnelCtx,
            funnelChart: funnelChart,
            data: data
        };
    }



    ko.applyBindings(dashboardVM('%userId%'));

});