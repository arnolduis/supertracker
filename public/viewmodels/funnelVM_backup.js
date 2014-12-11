(document).ready(function() {
    // Overall viewmodel for this screen, along with initial state
    function FunnelsViewModel() {
        
        //***********************  OBJECTS ************************** 
        function Funnel(_name) {
            name: _name,
            steps:
        }

        function Step () {
            return {
                event: '',
                properties: '',
                logic: '',
                value: '',
                type: ''
            };
        }

        //******************  HARDCODED AND SERVER DATA ************************** 
        var properties = ['Clicked','Browser','City','Country','Initial Referrer','Initial referring domain','Operating System', 'Referrer','Region','Screen Height','Screen Width'];
        var events =%events%;
        var operators = ko.observableArray([]);
        var operatorType = [ 
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

        //********************  OBSERVABLE DATA ************************** 
        var funnels = ko.observableArray([Funnel ('Mell'), Funnel ('Pina') ]);
        var funnelName = ko.observable();
        var step_event = ko.observable();
        var step_property = ko.observable();
        var step_operator = ko.observable();
        var step_value = ko.observable();
        var step = ko.computed(function(){
            return funnelName() +': '+ '<br>SELECT * FROM events <br>WHERE name = '+ step_event()+'<br>AND '+step_property()+' '+step_operator() +' '+step_value();
        });

        //**********************  OPERATIONS ************************** 
        function addFunnel() {
            console.log(funnelName());
            funnels.push(Funnel(funnelName()));
        }
        function addStep() {
            console.log('dummy');
        }

        //**************** FACTORY CONSTRUCTOR PATTER ************************** 
        return {
            // hardcoded
            events: events,
            properties: properties,
            operators: operators,
            operatorType: operatorType,
            // observed
            funnels: funnels,
            funnelName: funnelName,
            step_event: step_event,
            step_property: step_property,
            step_operator: step_operator,
            step_value: step_value,
            step: step,
            // methods
            addFunnel: addFunnel,
            addStep: addStep
        };
    }

    ko.applyBindings(new FunnelsViewModel());

});