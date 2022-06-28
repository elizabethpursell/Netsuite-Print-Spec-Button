define([], function(){
    /**
      * 
      * @NApiVersion 2.x
      * @NScriptType UserEventScript
      * @appliedtorecord lotnumberedassemblyitem
      */
    var exports = {};
    /**
      * <code>beforeLoad</code> event handler
      * 
      * @gov 0
      * 
      * @param context
      *        {Object}
      * @param context.newRecord
      *        {record} the new record being loaded
      * @param context.type
      *        {UserEventType} the action that triggered this event
      * @param context.form
      *        {form} The current UI form
      * 
      * @return {void}
      * 
      * @static
      * @function beforeLoad
      */
    function beforeLoad(context) {
        context.form.addButton({
            id: "custpage_printspec",
            label: "Print Spec",
            functionName: "onButtonClick"
        });
        context.form.clientScriptModulePath = "SuiteScripts/SpecButton/spec_button_click_cs.js";      //CS for placard button
    }
    exports.beforeLoad = beforeLoad;
    return exports;
    });