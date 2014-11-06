$(document).ready(function() {
    // Overall viewmodel for this screen, along with initial state

    function stepVM () {
        var events =%events%;
        var properties = ['Happened','Browser','City','Country','Initial Referrer','Initial referring domain','Operating System', 'Referrer','Region','Screen Height','Screen Width'];
        var operation_types = [ 
            { name: 'String', value: [
                { name: 'equals'       ,value: '=' },
                { name: 'not equals'   ,value: '!=' },
                { name: 'contains'     ,value: 'in' },
                { name: 'not contains' ,value: '!in' },
                { name: 'is set'       ,value: 'is setXXX' },
                { name: 'not set'      ,value: 'not setXXX' }
            ]},
            { name: 'Number', value: [
                { name: 'in between'    ,value: 'in between XXX' },
                { name: 'less than'     ,value: '<' },
                { name: 'equal to'      ,value: '=' },
                { name: 'greater than'  ,value: '>' }
            ]},
            { name: 'True/False', value: [
                { name: 'is'            ,value: '=' }
            ]},
            { name: 'Date', value: [
                { name: 'was XXX'       ,value: '<' }// tobb lepeses valasztas
            ]}, 
            { name: 'List', value: [
                { name: 'contains'      ,value: 'containtX' }
            ]}
        ];
        var available_operators = ko.observable();

        var event = ko.observable();
        var property = ko.observable();
        var operator = ko.observable();
        var value = ko.observable();

        function save () {
            return {
                // operation_types: operation_types(),
                event: event(),
                property: property(),
                operator: operator(),
                value: value()
            };
        }

        return {
            events: events,
            properties: properties,
            available_operators: available_operators,
            operation_types: operation_types,
            
            event: event,
            property: property,
            operator: operator,
            value: value,

            save: save
        };
    }

    function funnelVM () {
        var name = ko.observable();
        var steps = ko.observableArray([stepVM()]);
        
        function addStep() {
            steps.push(stepVM());
        }

        function save () {
            var funnelArray = [];
            for (var i = 0; i < steps().length; i++) {
                funnelArray.push(steps()[i].save());
            }
            console.log(funnelArray);
            return funnelArray;
        }

        return {
            name: name,
            steps: steps,
            addStep: addStep,
            save: save
        };
    }

    function dashboardVM() {      
        var funnels = ko.observableArray();
        var funnel = ko.observable(funnelVM());

        function addFunnel() {
            console.log('Meg nincs kesz:(');
        }

        return {
            funnels: funnels,
            funnel:funnel,
            // methods
            addFunnel: addFunnel
        };
    }

    ko.applyBindings(new dashboardVM());

});