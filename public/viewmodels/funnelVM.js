$(document).ready(function() {
    // Overall viewmodel for this screen, along with initial state

    function stepVM (stepJson) {
        var events = %events%;
        var properties = ['Happened','Browser','City','Country','Initial Referrer','Initial referring domain','Operating System', 'Referrer','Region','Screen Height','Screen Width'];
        var operation_types = [ 
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
            toJson: toJson
        };
    }

    function dashboardVM(_userId) {      
console.log(_userId);
        var userId = ko.observable(_userId);
        var serverFunnels = %funnels%;
        //[funnelVM({name: 'Dummy', steps:[stepVM().toJson()]})]
        var funnels = ko.observableArray();
        var funnelSelected = ko.observable();
        var funnelEdited = ko.observable();
        funnelSelected.subscribe(function () {
            funnelEdited(funnelVM(funnelSelected().toJson()));
        });

        // Fill up funnels with serverFunnels or with dummy data
        if (serverFunnels.length > 0) {
            for (var i = 0; i < serverFunnels.length; i++) {
                funnels.push(funnelVM(serverFunnels[i].funnel));
            }
        } else {
            funnels.push(funnelVM({name: 'Dummy', steps:[stepVM().toJson()]}));
        }
        funnelSelected(funnels()[0]);
        
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
                var update = -1;
                for (var i = 0; i < funnels().length; i++) {
                    if (funnels()[i].name() == funnelEdited().name()) {
                        update = i;
                        return;
                    }
                }
                if (update+1) {
                    funnels()[update] = funnelVM(funnelEdited().toJson());
                } else{
                    funnels.push(funnelVM(funnelEdited().toJson()));
                }
            })
            .fail(function(err) {
                console.log("error");
                console.log(err);
            });
        }

        function deleteFunnel () {
            // body...
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
            userId: userId,
            // methods
            addFunnel: addFunnel,
            saveFunnel: saveFunnel,
            deleteFunnel: deleteFunnel,
            test: test
        };
    }

    ko.applyBindings(new dashboardVM("arni"));

});