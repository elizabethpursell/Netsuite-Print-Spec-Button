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
        var bomArrayString = context.request.parameters.bomArrayString;                 //gets parameters from bom suitelet
        var custom_id = parseInt(context.request.parameters.custom_id);
        const bomArray = JSON.parse(bomArrayString);
        var renderer = render.create();
        var index = 0;
        for (index = 0; index < bomArray.length; index++){          //executes for all bom components
            var bomSearch = search.load({          //finds and loads bom components, no assemblies
                id: 'customsearchbom_no_wip'
            });
            var idFilter = search.createFilter({
                name: 'internalid',
                operator: 'is',
                values: [parseInt(bomArray[index])]
            });
            bomSearch.filters.push(idFilter);
            var bom_search_result = bomSearch.run().getRange(0, 1000);
            var bomSearchName = "bom" + index;      //creates template name for bom
            renderer.addSearchResults({             //adds bom to renderer
                templateName: bomSearchName,
                searchResult: bom_search_result
            });
        }
      	var revisions_search = search.load({        //loads search to find all spec revision memos, date ascending
        	id: 'customsearchspec_rev_asc'
        });
        var recordFilter = search.createFilter({
        	name: 'internalid',
        	operator: 'is',
        	values: [custom_id]
        });
        revisions_search.filters.push(recordFilter);
        var revisions_results = revisions_search.run();
        var results = revisions_results.getRange(0, 1000);
        renderer.addSearchResults({         //adds search results to renderer
            templateName: "spec_revisions",
            searchResult: results
        });
      	var desc_revisions_search = search.load({        //loads search to find all spec revision memos, date descending
        	id: 'customsearchspec_rev_desc'
        });
        desc_revisions_search.filters.push(recordFilter);
        var desc_revisions_results = desc_revisions_search.run();
        var desc_results = desc_revisions_results.getRange(0, 1000);
        renderer.addSearchResults({         //adds search results to renderer
            templateName: "date_desc",
            searchResult: desc_results
        });
        var assemblyRecord = record.load({
            type: record.Type.LOT_NUMBERED_ASSEMBLY_ITEM,
            id: custom_id
        });
        renderer.addRecord({              //adds current record to renderer
            templateName: 'record',
            record: assemblyRecord
        });
        assemblyRecord.setValue({       //adds number of boms to record field
            fieldId: "custitemnumsearches",
            value: index,
            ignoreFieldChange: false
        });
      	assemblyRecord.save();
        renderer.setTemplateByScriptId("CUSTTMPL_124_7232941_757");     //sets template as spec html template
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
