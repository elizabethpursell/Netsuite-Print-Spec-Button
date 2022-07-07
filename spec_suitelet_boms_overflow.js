define(['N/record', 'N/search', 'N/runtime', 'N/redirect'], function(record, search, runtime, redirect){
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
        var searchAssembliesString = context.request.parameters.searchAssembliesString;
        var custom_id = parseInt(context.request.parameters.custom_id);
        var i = parseInt(context.request.parameters.index);
        i = i + 1;
        const bomArray = JSON.parse(bomArrayString);
        const searchAssemblies = JSON.parse(searchAssembliesString);
        var overflow = false;
        for (index = i; index < searchAssemblies.length; index++){          //executes for all bom assemblies
            var assemblySearch = search.load({          //finds and loads assembly record
                id: 'customsearchbom_assembly'
            });
            var idFilter = search.createFilter({
                name: 'internalid',
                operator: search.Operator.IS,
                values: [parseInt(searchAssemblies[index])]
            });
            assemblySearch.filters.push(idFilter);
            var isLotItem = true;
            assemblySearch.run().each(function(result){
                isLotItem = result.getValue({
          	        name: "islotitem"
                });
      	    });
            if(isLotItem == true || isLotItem == 'T' || isLotItem == "true" || isLotItem == "Yes" || isLotItem == "yes"){       //loads with correct record type
                var assemblySearchRecord = record.load({
                    type: record.Type.LOT_NUMBERED_ASSEMBLY_ITEM,
                    id: parseInt(searchAssemblies[index])
                });
            }
            else{
                var assemblySearchRecord = record.load({
                    type: record.Type.ASSEMBLY_ITEM,
                    id: parseInt(searchAssemblies[index])
                });
            }
            var bom_id = assemblySearchRecord.getSublistValue({     //gets bom data from assembly; used for bom search
                sublistId: 'billofmaterials',
                fieldId: 'billofmaterials',
                line: 0
            });
            var bom_name = assemblySearchRecord.getSublistValue({
                sublistId: 'billofmaterials',
                fieldId: 'currentrevision',
                line: 0
            });
            if(bom_id != '' && bom_name != '' && bom_id != null && bom_name != null){
                var bomSearch = search.load({               //searches for components of bom that are not assemblies
                    id: 'customsearchbom_no_wip'
                });
                var bomFilter = search.createFilter({
                    name: 'billofmaterials',
                    operator: search.Operator.IS,
                    values: [bom_id]
                });
                var nameFilter = search.createFilter({
                    name: 'name',
                    operator: search.Operator.IS,
                    values: [bom_name]
                });
                bomSearch.filters.push(bomFilter);
                bomSearch.filters.push(nameFilter);
                bomSearch.run().each(function(result){
                    if(result != null && result != ''){
                        var bom_revision_id = result.getValue({     //adds the each bom's internal id to array without duplicates
                            name: "internalid",
                        });
              	        if(bom_revision_id != bomArray[(bomArray.length - 1)]){
                            bomArray.push(bom_revision_id);
                        }
                    }
                    return true;
                });
                var scriptObj = runtime.getCurrentScript();         //checks usage to see if there is enough to keep looping
			    var unitsRemaining = scriptObj.getRemainingUsage();
                if (unitsRemaining < 100){
            	    overflow = true;
				    break;                  //breaks from loop and calls overflow suitelet if not enough usage left
			    }
            }
        }
        var bomArrayString = JSON.stringify(bomArray);
        var currentAssembly = parseInt(custom_id);
        if(overflow == true){          //executes if overflow bom suitelet needed
            redirect.toSuitelet({                       //calls overflow bom suitelet with arrays, current index, and current assembly id as parameters
        	    scriptId: 'customscriptspec_suitelet_bomoverflow',
        	    deploymentId: 'customdeployspec_suitelet_bomoverflow',
        	    parameters: {
                    'bomArrayString': bomArrayString,
                    'custom_id': currentAssembly,
                    'index': index,
                    'searchAssembliesString': searchAssembliesString
                }
    	    });
        }
        else{               //executes if overflow bom suitelet not needed
            redirect.toSuitelet({                   //calls render suitelet with array and current assembly id as parameter
        	    scriptId: 'customscriptspec_suitelet_render',
        	    deploymentId: 'customdeployspec_suitelet_render',
        	    parameters: {
                    'bomArrayString': bomArrayString,
                    'custom_id': currentAssembly
        	    }
    	    });
        }
    }
    return {
        onRequest: onRequest
    }
});