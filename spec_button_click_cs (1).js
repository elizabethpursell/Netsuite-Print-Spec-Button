define(['N/url', 'N/currentRecord'], function (url, currentRecord) {
    /**
      * 
      * @NApiVersion 2.x
      * @NScriptType ClientScript
      * @appliedtorecord lotnumberedassemblyitem
      */
    var exports = {};
    /**
      * <code>pageInit</code> event handler
      * 
      * @gov XXX
      * 
      * @param context
      *        {Object}
      * @param context.mode
      *        {String} The access mode of the current record. will be one of
      *              <ul>
      *              <li>copy</li>
      *              <li>create</li>
      *              <li>edit</li>
      *              </ul>
      * 
      * @return {void}
      * 
      * @static
      * @function pageInit
      */
    function pageInit(context) {
        // TODO
    }
    function onButtonClick(){
        var suiteletURL = url.resolveScript({
            scriptId: 'customscriptspec_suitelet',      //script ID of suitelet
            deploymentId: 'customdeployspec_suitelet',       //deployment ID of suitelet
            returnExternalURL: false,
            params: {
                custom_id: currentRecord.get().id
            }
        });
        window.open(suiteletURL);
    }
    exports.onButtonClick = onButtonClick;
    exports.pageInit = pageInit;
    return exports;
    });