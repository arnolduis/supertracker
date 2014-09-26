// Overall viewmodel for this screen, along with initial state
function FunnelsViewModel() {
    
    //***********************  OBJECTS ************************** 
    function Funnel(_name) {
        return {
            name: _name,
            event: '',
            properties: '',
            logic: '',
            value: '',
            type: ''
        }
    }

    //******************  HARDCODED DUMMY DATA ************************** 
    var events =     ['event1','event2','event3','event4'];
    var properties = ['Browser','City','Country','Initial Referrer','Initial referring domain','Operating System', 'Referrer','Region','Screen Height','Screen Width'];
    var operators = ko.observableArray([

    ]);
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
    // var operatorType = [ 
    //     { name: 'String', value: ['equals','not equals','contains','not contains','is set','not set'] },
    //     { name: 'Number', value: ['in between','less than','equal to','greater than'] },
    //     { name: 'True/False', value: ['is'] },
    //     { name: 'Date', value: ['was XXX'] }, // tobb lepeses valasztas
    //     { name: 'List', value: ['contains'] }
    // ];    

    //********************  OBSERVABLE DATA ************************** 
    var funnels = ko.observableArray([
        Funnel ('Mell'),
        Funnel ('Pina')
    ]);

    funnelName = ko.observable();
    step_event = ko.observable();
    step_property = ko.observable();
    step_operator = ko.observable();
    step_value = ko.observable();
    step = ko.computed(function(){
        return funnelName() +': '+ '<br>SELECT * FROM events <br>WHERE name = '+ step_event()+'<br>AND '+step_property()+' '+step_operator() +' '+step_value();
    });

    //**********************  OPERATIONS ************************** 
    function addFunnel() {
        console.log(funnelName());
        funnels.push(Funnel(funnelName()));
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
        // methods
        addFunnel: addFunnel
    }
};

$(document).ready(function() {
    ko.applyBindings(new FunnelsViewModel());
});