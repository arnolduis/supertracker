$(document).ready(function() {
    // Overall viewmodel for this screen, along with initial state



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

    function dashboardVM(_userId) {      
        var funnelFrom;
        var funnelTo;




        var myCalendar;
        var t = new Date();
        console.log(t.format('yyyy-mm-dd'));
        // var tstr = t.getUTCFullYear()+"-"+t.getUTCMonth()+"-01";
        var tstr = t.format('yyyy-mm-dd');
        myCalendar = new dhtmlXCalendarObject(["date_from","date_to"]);
        myCalendar.setDate(tstr);
        myCalendar.hideTime();
        // init values
        byId("date_from").value = tstr;
        byId("date_to").value = tstr;
        
        function setSens(id, k) {
            // update range
            if (k == "min") {
                myCalendar.setSensitiveRange(byId(id).value, null);
            } else {
                myCalendar.setSensitiveRange(null, byId(id).value);
            }
        }
        function byId(id) {
            return document.getElementById(id);
        }





        var userId = ko.observable(_userId);
        var serverFunnels = %funnels%;
        var funnels = ko.observableArray();
        var funnelSelected = ko.observable();
        var funnelEdited = ko.observable();
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
        
        function addFunnel() {
            funnel(funnelVM());
        }

        function saveFunnel () {
            console.log('Saving funnel');

            var funnelToBeSentString = JSON.stringify({userId: userId(), funnel: funnelEdited().toJson()});

            // // A lokalstoragees moka azert, hogy biztonsagosan el lehessen menteni a funnelt.
            // if (localStorage.userFunnels) {
            //     var userFunnels = JSON.parse(localStorage.userFunnels);
            //     userFunnels.push(funnelToBeSentString);
            //     localStorage.userFunnels = JSON.stringify(userFunnels);
            // } else {
            //     localStorage.userFunnels = JSON.stringify([funnelToBeSentString]);             
            // }

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
            console.log('%path%/funnels/'+userId()+'/'+funnels()[funnelIndex].name());
            if (funnelIndex + 1) {
                $.ajax({
                    url: '%path%/funnels/'+userId()+'/'+funnels()[funnelIndex].name(),
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

            console.log("DateFrom> "+$("#date_from").val());
            console.log("DateTo  > "+$("#date_from").val());
            funnelEditedJSON.from = $("#date_from").val();
            funnelEditedJSON.to = $("#date_to").val();

            var funnelToBeSentString = JSON.stringify({userId: userId(), funnel: funnelEditedJSON});
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

        function test () {
            // var mystepJson = {
            //     operation_type: { 
            //         name: 'Date',
            //         operators: [{ name: 'was XXX', value: '<' }]
            //     },
            //     event: 'gomb1',
            //     property: 'Happened',
            //     operator: '<',
            //     value: ''
            // };
            // var mystep = stepVM();

            // console.log("Step test:");
            // // console.log(mystep.toJson());
            // console.log(stepVM().toJson()); //ttt tesztek a funnel mentesere. 

            // var myfunnel = funnelVM({
            //     name: "Nuni", 
            //     steps: [mystepJson,mystepJson]
            // });

            console.log("Funnel test:");
            console.log(funnelVM({name: 'Nuni', steps:[stepVM().toJson()]}).toJson());

            // myfunnel.save();
            // console.log(funnelVM(JSON.parse(localStorage.savedFunnel)).steps()[0].operation_type());
        }

        return {
            funnels: funnels,
            funnelSelected: funnelSelected,
            funnelEdited: funnelEdited,
            applyFunnel: applyFunnel,
            userId: userId,
            // methods
            addFunnel: addFunnel,
            saveFunnel: saveFunnel,
            deleteFunnel: deleteFunnel,
            setSens: setSens,
            byId: byId,
            test: test
        };
    }

    ko.applyBindings(dashboardVM('%userId%'));

});