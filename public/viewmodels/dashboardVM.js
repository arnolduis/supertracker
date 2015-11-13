$(document).ready(function() {
    // Overall viewmodel for this screen, along with initial state

    function dashboardVM(_userId) {  

        var tstr = new Date().format('yyyy-mm-dd');
        var userId = _userId;
        






                                    //////////////////////////////////////////////////////////////////////////////////////
                                    /******************************** FUNNEL ANALYSIS  **********************************/






        // Calendar
        var funnelCalendar;
        funnelCalendar = new dhtmlXCalendarObject(["funnel_date_from","funnel_date_to"]);
        funnelCalendar.setDate(tstr);
        funnelCalendar.hideTime();
        $("#funnel_date_from").val(tstr);
        $("#funnel_date_to").val(tstr);
        
        function setSens(id, k) {
            // update range
            if (k == "min") {
                funnelCalendar.setSensitiveRange($("#funnel_date_from").val(), null);
            } else {
                funnelCalendar.setSensitiveRange(null, $("#funnel_date_to").val());
            }
        }

        // Funnels
        var serverFunnels = %funnels%;

        var funnels = ko.observableArray();
        var funnelEdited = ko.observable();
        var funnelSelected = ko.observable();
        var exactMatch = ko.observable(false);
        var userwiseMatch = ko.observable(false);
        var newUsers = ko.observable(false);
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
            funnels.push(funnelVM({name: 'Dummy', steps:[stepVM().toJson()]}));
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
                        funnels.push(funnelVM({name: 'Dummy', steps:[stepVM().toJson()]}));
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


            console.log("DateFrom> "+$("#funnel_date_from").val());
            console.log("DateTo  > "+$("#funnel_date_to").val());
            funnelEditedJSON.from = $("#funnel_date_from").val();
            funnelEditedJSON.to = $("#funnel_date_to").val();
            funnelEditedJSON.options = {
                exact: exactMatch(),
                userwise: userwiseMatch(),
                newUsers: newUsers()
            };

            var funnelToBeSentString = JSON.stringify({userId: userId, funnel: funnelEditedJSON});
            console.log(funnelEditedJSON);
            $.ajax({
                url: '%path%/funnels/apply',
                type: 'POST',
                contentType: 'application/json',
                data: funnelToBeSentString
            })
            .done(function(res) {
                console.log("success");
                console.log(res);
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
            funnels: funnels,
            funnelSelected: funnelSelected,
            funnelEdited: funnelEdited,
            applyFunnel: applyFunnel,
            exactMatch: exactMatch,
            userwiseMatch: userwiseMatch,
            newUsers: newUsers,
            // userId: userId,
            // // methods
            addFunnel: addFunnel,
            saveFunnel: saveFunnel,
            deleteFunnel: deleteFunnel,
            setSens: setSens,
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

    function funnelVM (funnelJson) {
        var name = funnelJson ? ko.observable(funnelJson.name) : ko.observable();
        var steps = ko.observableArray([]);
        if (funnelJson) {
            for (var i = 0; i < funnelJson.steps.length; i++) {
                steps.push(stepVM(funnelJson.steps[i]));
            }
        } else {
            steps.push(stepVM());
        }



        function addStep() {
            steps.push(stepVM());
        }

        function removeStep (step) {
            //ttt nem mukodik
            console.log('removeStep');
            steps.remove(step);
        }

        function toJson () {
            var funnelJson = {name: "", steps: []};//ttt itt lehet hogy lehet roviditeni
            funnelJson.name = name();
            for (var i = 0; i < steps().length; i++) {
                funnelJson.steps.push(steps()[i].toJson());
            }
            return  funnelJson;
        }



        return {
            name: name,
            steps: steps,
            addStep: addStep,
            removeStep: removeStep,
            toJson: toJson
        };
    }

    function stepVM (stepJson) {
        var events = %events%;
        var properties = ['','Browser','City','Country','Initial Referrer','Initial referring domain','Operating System', 'Referrer','Region','Screen Height','Screen Width'];
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

    function retentionPanelVM () {
        var cohRows = ko.observable(5);
        var cohCols = ko.observable(12);
        var retentionMX = ko.observableArray(); 

        // initialize
        var tmp = [];
        // for (var i = 0; i < cohRows(); i++) {
        //     tmp.push([]);
        //     for (var j = 0; j < cohCols(); j++) {
        //         tmp[i][j] = "Nuni";
        //     }
        // }
        retentionMX(tmp);

        // Calendar
        var cohortCalendar = new dhtmlXCalendarObject(["cohort_date_from","cohort_date_to"]);
        cohortCalendar.setWeekStartDay(1);
        cohortCalendar.setDate(tstr);
        cohortCalendar.hideTime();
        $("#cohort_date_from").val("2014-01-01");
        $("#cohort_date_to").val("2014-01-08");
        
        // Initial value
        applyCohort();


        function setSensCohort(id, k) {
            // update range
            if (k == "min") {
                cohortCalendar.setSensitiveRange($("#cohort_date_from").val(), null);
            } else {
                cohortCalendar.setSensitiveRange(null, $("#cohort_date_to").val());
            }
        }

        function applyCohort() {
            var data = {};
            data.cols = cohCols();
            data.rows = cohRows();
            data.cohort_from = $("#cohort_date_from").val();
            data.cohort_to   = $("#cohort_date_to").val();
            data.cohortEvent = "Subscribe";
            data.returnEvent = "sessionStart";


            $.ajax({
                url: '%path%/cohort/getRetentionMatrix',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            })
            .done(function(res) {
                console.log("success");
                for (var i = 0; i < res.length; i++) {
                    for (var j = 1; j < res[i].length; j++) {
                        res[i][j] = Math.round(res[i][j] / res[i][0] * 100) + "%";
                    }
                }
                retentionMX(res);
        
            })
            .fail(function() {
                console.log("error");
            });
        }
    }

    function segmentationPanelVM () {
        var events = %events%;
              var properties = ['','Browser','City','Country','Initial Referrer','Initial referring domain','Operating System', 'Referrer','Region','Screen Height','Screen Width'];
              var intervals = ['30 days','24 weeks','12 months'];
              var segCondition = ko.observable({});

              var segFrom = null; //ttt custom binding
              var segTimeInt = ko.observable(); // hour, day, week month
              var segEvent = ko.observable(); // one event
              var segGrpBy = ko.observable(); // one property
              var segData = {}; // filling up the chart

              // var segCond =  {
              //     "$or": [{
              //             "sessionId": "lolo"
              //         }, {
              //             "sessionId": "lolo"
              //     }]
              // };



              // Calendar
              var segCalendar = new dhtmlXCalendarObject("segFrom");
              $("#segFrom").val("2014-01-01");


              // Chart
              function applySegQuery() {
                  segFrom = new Date($('#segFrom').val() + 'T00:00:00Z');
                  var xLabels = [];
                  
                  switch (segTimeInt()) {
                      case '30 days':
                          segTo = plusXDay(segFrom, 30);
                          for (var i = 0; i < 30; i++) {
                              xLabels[i] = plusXDay(segFrom, i).format('mm-dd') ;
                          }
                          break; 
                      case '24 weeks':
                          segTo = plusXDay(segFrom, 168);
                          for (var i = 0; i < 24; i++) {
                              xLabels[i] = plusXDay(segFrom, i * 7).format('mm-dd') ;
                          }

                          // while(iDate.gerDay() == 0) {
                          //     iDate.setDate(iDate.getDate() - 1);
                          // }
                          break; 
                      case '12 months':
                          segTo = plusXMonth(segFrom, 12);
                          for (var i = 0; i < 12; i++) {
                              xLabels[i] = plusXMonth(segFrom, i * 1).format('mm-dd') ;
                          }
                          break; 
                      default: 
                          segTo = plusXDay(segFrom, 30);
                          for (var i = 0; i < 30; i++) {
                              xLabels[i] = plusXDay(segFrom, i).format('mm-dd') ;
                      }
                  }

                  var data = {
                      segFrom: segFrom,
                      segTimeInt: segTimeInt(),
                      segEvent: segEvent(),
                      segGrpBy: segGrpBy(),

                  };

                  $.ajax({
                      url: '%path%/segmentation/apply',
                      type: 'POST',
                      contentType: 'application/json',
                      data: JSON.stringify(data)
                  })
                  .done(function(res) {
                      console.log("success");

                      $('#segCanvas').replaceWith('<canvas id="segCanvas" width="680" height="300"></canvas>');
                      var segCtx = document.getElementById("segCanvas").getContext("2d");
                      var segOptions = {
                          multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>",
                          legendTemplate : '<ul>' /
                                            +'<% for (var i=0; i<datasets.length; i++) { %>'  /
                                              +'<li>' /
                                              +'<span style=\"background-color:<%=datasets[i].lineColor%>\"></span>'  /
                                              +'<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>'    /
                                            +'</li>'  /
                                          +'<% } %>'  /
                                        +'</ul>'  
                          };
                      if (res.length === 0) {
                          segCtx.font="40px Georgia"; //ttt
                          segCtx.fillText("Fosi az adat, maki!",10,50);
                          var  segData = {
                              labels: xLabels,
                              datasets: []
                          };
                      } else {
                          var segData = fillsegData(res, xLabels);
                          var segChart = new Chart(segCtx).Line(segData, segOptions); 
                      }
                  })
                  .fail(function() {
                      console.log("error");
                  });
              }


              function fillsegData (res, xLabels) {
                  var segData = {
                      labels: xLabels,
                      datasets: []
                  };


                  for (var i = 0; i < res.length; i++) {
                      var datasetSchema = {
                          label: '',
                          fillColor: ",0.2)",
                          strokeColor: ",1)",
                          pointColor: ",1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: ",1)",
                          data: []
                      };
                      var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255);

                      datasetSchema.label = res[i].grpBy;
                      datasetSchema.fillColor = color + datasetSchema.fillColor;
                      datasetSchema.strokeColor = color + datasetSchema.strokeColor;
                      datasetSchema.pointColor = color + datasetSchema.pointColor;
                      datasetSchema.pointHighlightStroke = color + datasetSchema.pointHighlightStroke;
                      datasetSchema.data = res[i].data;
                      segData.datasets.push(datasetSchema);
                  }
                  return segData;
              }
    }

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