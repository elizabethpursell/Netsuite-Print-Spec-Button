define(['N/render', 'N/record', 'N/search'], function(render, record, search){
  /**
    * @NApiVersion 2.x
    * @NScriptType Suitelet
    * @appliedtorecord lotnumberedassemblyitem
    */
  /**
    * <code>onRequest</code> event handler
    * @gov 0
    * 
    * @param request
    *        {Object}
    * @param response
    *        {String}
    * 
    * @return {void}
    * 
    * @static
    * @function onRequest
    */
  function onRequest(context) {
    var custom_id = context.request.parameters.custom_id;   //gets internal id of current record from CS program
    var renderer = render.create();
    assemblyRecord = record.load({        //loads current record
      type: record.Type.LOT_NUMBERED_ASSEMBLY_ITEM,
      id: custom_id
    });
    var bom_id = assemblyRecord.getValue({    //gets the internal id of current record's bom
      fieldId: 'custitembom_id'
    });
    if(bom_id != ''){     //adds bom record to renderer if internal id of bom given
      renderer.addRecord({
        templateName: 'bom',
       	record: record.load({
          type: record.Type.BOM_REVISION,
          id: bom_id
        })
      });
    }
    var revisions_search = search.create({    //creates search for revisions of current record with system notes
      type: search.Type.SYSTEM_NOTE,
      filters: [{
        name: "newvalue",
        operator: "isnotempty"
      }, {
        name: "recordid",
        operator: "equalto",
        values: [custom_id]
      }],
      columns: [{
        name: "date",
        sort: search.Sort.ASC     //dates in ascending order
      }, {
        name: "field"
      }, {
        name: "newvalue"
      }, {
        name: "name"
      }]
    });
    var revisions_results = revisions_search.run();       //runs search
    var results = revisions_results.getRange(0, 1000);
    renderer.addSearchResults({         //adds search results to renderer
      templateName: "spec_revisions",
      searchResult: results
    });
    var desc_revisions_search = search.create({    //creates search for revisions of current record with system notes
      type: search.Type.SYSTEM_NOTE,
      filters: [{
        name: "newvalue",
        operator: "isnotempty"
      }, {
        name: "recordid",
        operator: "equalto",
        values: [custom_id]
      }],
      columns: [{
        name: "date",
        sort: search.Sort.DESC     //dates in descending order
      }, {
        name: "field"
      }, {
        name: "newvalue"
      }, {
        name: "name"
      }]
    });
    var desc_revisions_results = desc_revisions_search.run();       //runs search
    var desc_results = desc_revisions_results.getRange(0, 1000);
    renderer.addSearchResults({         //adds search results to renderer
      templateName: "date_desc",
      searchResult: desc_results
    });
    renderer.addRecord({              //adds current record to renderer
      templateName: 'record',
      record: assemblyRecord
    });
    renderer.setTemplateByScriptId("CUSTTMPL_124_7232941_757");     //sets renderer's template as spec html template
    context.response.addHeader({
      name: 'Content-Type:',
      value: 'application/pdf'
    });
    context.response.addHeader({
  	  name: 'Content-Disposition',
      value: 'inline; filename="Spec.pdf"'
    });
    renderer.renderPdfToResponse(context.response);     //opens rendered pdf in new tab
  }
  return {
    onRequest: onRequest
  }
});
