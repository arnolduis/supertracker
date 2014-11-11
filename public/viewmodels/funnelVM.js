$(document).ready(function() {
    // Overall viewmodel for this screen, along with initial state

    function stepVM (stepJson) {
        var events =%events%;
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
        var value          = stepJson ? ko.observable(stepJson.value)          : ko.observable();

        function save () {
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
            save: save
        };
    }

    function funnelVM (funnelJson) {
        var name = funnelJson ? ko.observable(funnelJson.name) : ko.observable();
        var steps = ko.observableArray();
        if (funnelJson) {
            for (var i = 0; i < funnelJson.steps.length; i++) {
                steps.push(stepVM(funnelJson.steps[i]));
            }
        } else {
            steps.push([stepVM()]);
        }



        function addStep() {
            steps.push(stepVM());
        }

        function save () {
            var savedFunnel = {name: "", steps: []};//ttt itt lehet hogy lehet roviditeni
            savedFunnel.name = name();
            for (var i = 0; i < steps().length; i++) {
                savedFunnel.steps.push(steps()[i].save());
            }
            localStorage.savedFunnel = JSON.stringify(savedFunnel);

            return savedFunnel;
        }



        return {
            name: name,
            steps: steps,
            addStep: addStep,
            save: save
        };
    }

    function dashboardVM() {      

        var userId = ko.observable("arni");
        var funnels = ko.observableArray([funnelVM({name: 'Mell', steps:[stepVM()]}), funnelVM({name: 'Pina', steps: [stepVM()]})]);
        var funnel = ko.observable();

        function test () {
            var mystepJson = {
                operation_type: { 
                    name: 'Date',
                    operators: [{ name: 'was XXX', value: '<' }]
                },
                event: 'gomb1',
                property: 'Happened',
                operator: '<',
                value: ''
            };
            var mystep = stepVM(mystepJson);

            // console.log("Step test:");
            // console.log(stepVM(mystep.save()).operation_type()); //ttt tesztek a funnel mentesere. 

            var myfunnel = funnelVM({
                name: "Nuni", 
                steps: [mystepJson,mystepJson]
            });

            // console.log("Funnel test:");
            // console.log(funnelVM(myfunnel.save()).steps()[0].operation_type());

            // myfunnel.save();
            console.log(funnelVM(JSON.parse(localStorage.savedFunnel)).steps()[0].operation_type());
        }
        
        function addFunnel() {
            console.log('Meg nincs kesz:(');
        }

        function loadFunnel () {
            // body...
        }

        return {
            funnels: funnels,
            funnel: funnel,
            userId: userId,
            // methods
            addFunnel: addFunnel,
            test: test
        };
    }

    ko.applyBindings(new dashboardVM());

});