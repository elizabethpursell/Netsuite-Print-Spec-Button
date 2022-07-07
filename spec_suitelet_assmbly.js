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
        var custom_id = context.request.parameters.custom_id;   //gets internal id of current record from CS program
        var assemblyRecord = record.load({        //loads current record
            type: record.Type.LOT_NUMBERED_ASSEMBLY_ITEM,
            id: custom_id
        });
        var bom_id = assemblyRecord.getSublistValue({       //gets bom data from current record; used for bom search
            sublistId: 'billofmaterials',
            fieldId: 'billofmaterials',
            line: 0
        });
        var bom_name = assemblyRecord.getSublistValue({
            sublistId: 'billofmaterials',
            fieldId: 'currentrevision',
            line: 0
        });
        const searchAssemblies = [custom_id];       //creates array of internal ids of all assemblies
        var index = 0;
        var overflow = false;
        if(bom_id != '' && bom_name != '' && bom_id != null && bom_name != null){
            for (index = 0; index < searchAssemblies.length; index++){          //executes for all bom assemblies
                if(searchAssemblies[index] != custom_id){
              	    var assemblySearch = search.load({          //finds and loads current assembly record
                	    id: 'customsearchbom_assembly'
            	    });
            	    var idFilter = search.createFilter({
                	    name: 'internalid',
                	    operator: search.Operator.IS,
                	    values: [searchAssemblies[index]]
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
                            id: searchAssemblies[index]
                        });
                    }
                    else{
                        var assemblySearchRecord = record.load({
                            type: record.Type.ASSEMBLY_ITEM,
                            id: searchAssemblies[index]
                        });
                    }
                    bom_id = assemblySearchRecord.getSublistValue({     //gets bom data from current assembly; used for bom search
                        sublistId: 'billofmaterials',
                        fieldId: 'billofmaterials',
                        line: 0
                    });
                    bom_name = assemblySearchRecord.getSublistValue({
                        sublistId: 'billofmaterials',
                        fieldId: 'currentrevision',
                        line: 0
                    });
                }
          	    if(bom_id != '' && bom_name != '' && bom_id != null && bom_name != null){
            	    var bomSearch = search.load({               //searches for components of assemblies bom that are also assemblies
                	    id: 'customsearchbom_only_wip'
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
                    	    var assembly_id = result.getValue({     //adds the each assembly's internal id to array
                        	    name: "item",
                        	    join: "component"
                    	    });
                    	    searchAssemblies.push(assembly_id);
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
        }
        var searchAssembliesString = JSON.stringify(searchAssemblies);
        if (overflow == true){          //executes if overflow assembly suitelet needed
            redirect.toSuitelet({                       //calls overflow assembly suitelet with array and current index as parameters
                scriptId: 'customscriptspec_suitelet_overflow',
                deploymentId: 'customdeployspec_suitelet_overflow',
                parameters: {
                    'searchAssembliesString': searchAssembliesString,
                    'index': index
                }
            });
        }
        else{               //executes if overflow assembly suitelet not needed
            redirect.toSuitelet({                   //calls bom suitelet with array and current assembly id as parameters
                scriptId: 'customscriptspec_suitelet_boms',
                deploymentId: 'customdeployspec_suitelet_boms',
                parameters: {
          	        'searchAssembliesString': searchAssembliesString,
                  	'custom_id': custom_id
                }
            });
        }
    }
    return {
        onRequest: onRequest
    }
});