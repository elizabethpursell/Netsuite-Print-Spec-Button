# Netsuite-Print-Spec-Button
## Project Overview
### Purpose
This custom print button allows for a product's specifications to be easily accessible for audits and production.
The button pulls data from NetSuite records to render a PDF using the Advanced PDF/HTML Templates feature. Some
information that can be displayed is the product information, nutrition facts, sensory descriptions, weight
settings, packaging information, and a full bill of materials. This project also sets up a consistent data storage
infrastructure using custom fields and record types. An optional feature is to create dropdown selections that can
autofill the data fields.
### Features
- Custom Print Button
- PDF Template
- Complete Bill of Materials
- Autofilled Fields
- Reliable Data Storage
- Revision Tracker
### Prerequisites
- SuiteScript/JavaScript
  - Modules: N/url, N/currentRecord, N/record, N/search, N/runtime, N/redirect, N/render
  - SuiteScript Types: Client Script, User Event Script, Suitelet
  - API Version: 2.x
- Advanced PDF/HTML Templates
  - Languages: HTML, FreeMarker, XML, CSS
- Saved Searches
- NetSuite Custom Fields/Record Types
### Explanation of Bill of Materials Feature
For the PDF, I wanted to present all the components in a product's bill of materials, without any assemblies. This
meant that I would need to locate every component that is an assembly so that I could find those assemblies' 
components as well. To do this, I created a saved search that would run for every assembly that is included in the
product's bill of materials. From each search result, I added the names for the bill of materials revisions
to an array. This array of bill of materials revision names would then be used in another saved search that locates
all the non-assembly components in the bill of materials. I would use the results from this search to find the
internal IDs of the item records and add those to an array, creating an array of all the internal IDs of all the
components in the product's full bill of materials. It will only include non-assembly items. The array of internal
IDs would then be used to load all the item records and add them to the PDF template for generation.
### Explanation of Overflow Programs
Due to all the saved searches that are run to generate the complete bill of materials, the programs go over NetSuite's
usage limits. To combat this, once the suitelet reached the limit, I would call another suitelet that would continue
the code from where it left off. The suitelet would give the array of internal IDs and its current place in the array
as parameters to the new suitelet. 
## Project Setup
### Saved Searches
Be sure to note the saved search IDs.
- **Search for Assemblies from BOM:**
    - Function: loads assemblies as the correct record type; uses the array that holds the internal IDs for all the bill of materials components that are also assemblies
    - Search Type: Item
    - Result Columns: Name, Type, Internal ID, Is Lot Numbered Item
    - Filters: Internal ID
    - Permissions: Public
- **Search for BOM for Spec Only Assemblies:**
    - Function: locates all the internal IDs of the components of a bill of materials revision that are assemblies; runs for each assembly in the array of assembly internal IDs; filters using the name of the assembly's current bill of materials revision
    - Search Type: Bill of Materials Revision
    - Criteria: Component : Item Type is Assembly
    - Result Columns: Bill of Materials, Name, Component : Base Units, Component : BoM Quantity, Component : BoM Quantity in Base Units, Component : Component Yield, Component : Description, Component : Internal ID Component : Item, Component : Item Source, Component : Item Subtype, Component : Item Type, Component : Line ID, Component : Quantity, Component : Quantity in Base Units, Component : Revision Name, Component : Units, Component : Weight
    - Filters: Bill of Materials, Name, Component : Item, Internal ID
    - Permissions: Public
- **Search for BOM for Spec No Assemblies:**
    - Function: locates all the internal IDs of the components of a bill of materials revision that are not assemblies; runs for each assembly in the array of assembly internal IDs; finds all the non-assembly component's in the bill of material, so they can be rendered in the PDF
    - Search Type: Bill of Materials Revision
    - Criteria: Component : Item Type is not Assembly
    - Result Columns: Bill of Materials, Name, Component : Base Units, Component : BoM Quantity, Component : BoM Quantity in Base Units, Component : Component Yield, Component : Description, Component : Internal ID, Component : Item, Component : Item Source, Component : Item Subtype, Component : Item Type, Component : Line ID, Component : Quantity, Component : Quantity in Base Units, Component : Revision Name, Component : Units, Component : Weight, Internal ID
    - Filters: Bill of Materials, Name, Component : Item, Internal ID
    - Permissions: Public
- **Search for Spec Revisions Asc:**
    - Function: collects all the spec revision memos in ascending order according to date
    - Search Type: Item
    - Criteria: System Notes : New Value is not empty
    - Sort By: System Notes : Date
    - Result Columns: System Notes : Date, System Notes : Field, System Notes : New Value, System Notes : Set by
    - Filters: Internal ID
    - Permissions: Public
- **Search for Spec Revisions Desc:**
    - Function: collects all the spec revision memos in descending order according to date
    - Search Type: Item
    - Criteria: System Notes : New Value is not empty
    - Sort By: System Notes : Date (Descending)
    - Result Columns: System Notes : Date, System Notes : Field, System Notes : New Value, System Notes : Set by
    - Filters: Internal ID
    - Permissions: Public
### Record Fields
New custom fields will be needed to added to item records. Data that I used includes product information, nutrition facts, sensory descriptions, weight settings, and packaging information. I added all the fields to its own subtab on the item record form.
### Optional Autofill Feature
- **Purpose:** reduces the entering of repetitive information over different products; creates a dropdown selection that will autofill the fields based on a custom record type
- **Example Record Types:** flavor, weight settings, pallet pattern
- **Create Custom Record Type:** in NetSuite, navigate to Customization>List, Records, & Fields>Record Types>New; name your record type based on your desired dropdown options and save; reopen the new record type by navigating Customization>List, Records, & Fields>Record Types and selecting the record type; add new fields under the "Fields" subtab based on the fields that you want autofilled 
- **Dropdown Field Setup:** create a new item record field by navigating Customization>List, Records, & Fields>Item Fields>New; name the field based on your record type; select the field type as "List/Record"; under the type selection, specify the List/Record as your custom record type and save
- **Storing Data in Record Types:** in edit mode on an item record, find your new dropdown field; new to the field there will be a plus sign that can be used to add new options to the dropdown; pressing the plus sign will open a menu to add a new record of your custom record type; name the record what you want the dropdown label to be; input the data into the fields and save; this dropdown selection can be used anytime in the future
- **Autofill Configuration:** to source the item field data according to the dropdown selections, open the custom item field by navigating Customization>List, Records, & Fields>Item Fields and selecting the desired field; open the "Sourcing & Filtering" subtab; under "Source List," select the custom record type; under "Source From," select the field on the custom record type that you want to copy the information from; if you would only like to source the item fields from the custom record type and not store any field changes, unselect the "Store Value" checkbox; save and apply the change to forms; repeat for all fields that need to be autofilled
- **Using the Selections:** open the item record that you would like to use the dropdown selections on and enter edit mode; find the autofill dropdowns and select the desired option; it should fill all the field that are associated with the dropdown's record type
### Uploading to NetSuite
- **Adding a SuiteScript to the File Cabinet:** navigate Customization>Scripting>Scripts>New; next to the "Script File" dropdown, press the plus sign to upload a new SuiteScript file; select the NetSuite folder that you want to store the SuiteScript files in; under "Select File," press the "Choose File" button; select the SuiteScript file that you want to upload and press open; save and press the blue "Create Script Record" button; name the file, input a relevant ID, and save
## File Descriptions
### spec_button_es
**Programming Languages:** JavaScript, SuiteScript 2.0
**SuiteScript Type:** User Event Script, beforeLoad
**Description:** creates the custom print button for all Lot Numbered Assembly Item records
**Catering the Code to Your NetSuite:**
- Applying to Different Record Type: change the JSDoc tag from "lotnumberedassemblyitem" to the relevant record type
- Changing the Button Label: find the function "context.form.addButton" and change the parameter "label" to the new label, keeping the new name in quotation marks
- Calling a Different Client Script: find the function "context.form.clientScriptModulePath" and specify the path where your client script file is stored
**Deploying SuiteScript:** go to the SuiteScript file; press the "Deploy Script" button; enter a name and relevant ID; change the status to "Testing"; under "Execute As Role," choose "Administrator" so that the code will get full access to NetSuite and will not create any permissions errors; under "Applies To," select the record type that you want the button to appear on (I used Lot Numbered Assembly/Bill of Materials); once the code has been tested, change the status to "Released" and select who can use the button under the "Audience" subtab (selecting "All Roles" will make all users able to use it)
### spec_button_click_cs
**Programming Languages:** JavaScript, SuiteScript 2.0
**SuiteScript Type:** Client Script, pageInit and onButtonClick
**Description:** calls the first suitelet to render and generate the PDF when the button is pressed
**Catering the Code to Your NetSuite:**
- Applying to Different Record Type: change the JSDoc tag from "lotnumberedassemblyitem" to the relevant record type
- Calling a Different Suitelet: find the line "var suiteletURL = url.resolveScript" and change the scriptId and deploymentId to the information associated with the desired suitelet
**Deploying SuiteScript:** go to the SuiteScript file; press the "Deploy Script" button; enter a name and relevant ID; change the status to "Testing"; under "Applies To," select the record type that you want the button to appear on (I used Lot Numbered Assembly/Bill of Materials); once the code has been tested, change the status to "Released" and select who can use the button under the "Audience" subtab (selecting "All Roles" will make all users able to use it)
### spec_suitelet
**Programming Languages:** JavaScript, SuiteScript 2.0
**SuiteScript Type:** Suitelet, onRequest
**Description:** collects the internal IDs for all the components of the product's bill of materials that are assemblies
**Catering the Code to Your NetSuite:**
- Applying to Different Record Type: change the JSDoc tag from "lotnumberedassemblyitem" to the relevant record type; change the saved searches to search under the correct record type; whenever there is a record load instance (record.load), change the record type to the correct one
- Changing the Saved Search IDs: whenever there is a search load instance (search.load), change the parameter "id" to the correct search ID
- Calling a Different Suitelet: find the function "redirect.toSuitelet" and change the scriptId and deploymentId to the information associated with the desired suitelet
**Deploying SuiteScript:** go to the SuiteScript file; press the "Deploy Script" button; enter a name and relevant ID; change the status to "Testing"; under "Execute As Role," choose "Administrator" so that the code will get full access to NetSuite and will not create any permissions errors; once the code has been tested, change the status to "Released" and select who can use the button under the "Audience" subtab (selecting "All Roles" will make all users able to use it)
### spec_suitelet_overflow
**Programming Languages:** JavaScript, SuiteScript 2.0
**SuiteScript Type:** Suitelet, onRequest
**Description:** continues collecting the internal IDs for all the components of the product's bill of materials that are assemblies if the first suitelet does not have enough usage left
**Catering the Code to Your NetSuite:**
- Applying to Different Record Type: change the JSDoc tag from "lotnumberedassemblyitem" to the relevant record type; change the saved searches to search under the correct record type; whenever there is a record load instance (record.load), change the record type to the correct one
- Changing the Saved Search IDs: whenever there is a search load instance (search.load), change the parameter "id" to the correct search ID
- Calling a Different Suitelet: find the function "redirect.toSuitelet" and change the scriptId and deploymentId to the information associated with the desired suitelet
**Deploying SuiteScript:** go to the SuiteScript file; press the "Deploy Script" button; enter a name and relevant ID; change the status to "Testing"; under "Execute As Role," choose "Administrator" so that the code will get full access to NetSuite and will not create any permissions errors; once the code has been tested, change the status to "Released" and select who can use the button under the "Audience" subtab (selecting "All Roles" will make all users able to use it)
### spec_suitelet_bom
**Programming Languages:** JavaScript, SuiteScript 2.0
**SuiteScript Type:** Suitelet, onRequest
**Description:** collects the internal IDs for all the components of the product's bill of materials that are not assemblies
**Catering the Code to Your NetSuite:**
- Applying to Different Record Type: change the JSDoc tag from "lotnumberedassemblyitem" to the relevant record type; change the saved searches to search under the correct record type; whenever there is a record load instance (record.load), change the record type to the correct one
- Changing the Saved Search IDs: whenever there is a search load instance (search.load), change the parameter "id" to the correct search ID
- Calling a Different Suitelet: find the function "redirect.toSuitelet" and change the scriptId and deploymentId to the information associated with the desired suitelet
**Deploying SuiteScript:** go to the SuiteScript file; press the "Deploy Script" button; enter a name and relevant ID; change the status to "Testing"; under "Execute As Role," choose "Administrator" so that the code will get full access to NetSuite and will not create any permissions errors; once the code has been tested, change the status to "Released" and select who can use the button under the "Audience" subtab (selecting "All Roles" will make all users able to use it)
### spec_suitelet_bomoverflow
**Programming Languages:** JavaScript, SuiteScript 2.0
**SuiteScript Type:** Suitelet, onRequest
**Description:** continues collecting the internal IDs for all the components of the product's bill of materials that are not assemblies if the third suitelet does not have enough usage left
**Catering the Code to Your NetSuite:**
- Applying to Different Record Type: change the JSDoc tag from "lotnumberedassemblyitem" to the relevant record type; change the saved searches to search under the correct record type; whenever there is a record load instance (record.load), change the record type to the correct one
- Changing the Saved Search IDs: whenever there is a search load instance (search.load), change the parameter "id" to the correct search ID
- Calling a Different Suitelet: find the function "redirect.toSuitelet" and change the scriptId and deploymentId to the information associated with the desired suitelet
**Deploying SuiteScript:** go to the SuiteScript file; press the "Deploy Script" button; enter a name and relevant ID; change the status to "Testing"; under "Execute As Role," choose "Administrator" so that the code will get full access to NetSuite and will not create any permissions errors; once the code has been tested, change the status to "Released" and select who can use the button under the "Audience" subtab (selecting "All Roles" will make all users able to use it)
### spec_suitelet_render
**Programming Languages:** JavaScript, SuiteScript 2.0
**SuiteScript Type:** Suitelet, onRequest
**Description:** generates and renders PDF using array of bill of materials components' internal IDs, current record, and revision memos
**Catering the Code to Your NetSuite:**
- Applying to Different Record Type: change the JSDoc tag from "lotnumberedassemblyitem" to the relevant record type; change the saved searches to search under the correct record type; whenever there is a record load instance (record.load), change the record type to the correct one
- Changing the Saved Search IDs: whenever there is a search load instance (search.load), change the parameter "id" to the correct search ID
- Calling a Different Suitelet: find the function "redirect.toSuitelet" and change the scriptId and deploymentId to the information associated with the desired suitelet
- Adding Another Record to the Template:
**Deploying SuiteScript:** go to the SuiteScript file; press the "Deploy Script" button; enter a name and relevant ID; change the status to "Testing"; under "Execute As Role," choose "Administrator" so that the code will get full access to NetSuite and will not create any permissions errors; once the code has been tested, change the status to "Released" and select who can use the button under the "Audience" subtab (selecting "All Roles" will make all users able to use it)
## Creating the PDF Template
**Opening New Template:** open Advanced PDF/HTML Templates by navigating Customization>Forms>Advanced PDF/HTML Templates; find a template that can be the foundation to the new template (I used a Bill of Materials type) and press "Customize"
**Customizing With HTML:** enable "Source Code" in the top right of the new template; use this HTML code as a base; used FreeMarker to take data from records that were added to the template; use the name that is specified in the "templateName" parameter when the record was added to the template (ex. renderer.addSearchResults or renderer.addRecord); if data is getting pulled directly from record use the format ${templateName.fieldName}; if data is getting pulled from sublist use the format ${templateName.sublistName.fieldName}; press save when edits are completed
**Customizing With Advanced PDF/HTML Template Features:** disable "Source Code" in the top right of the new template; use the textbox, table, fields, and other tools to modify the template
## References
### Images
- **Example PDF:**
- **UML of Data Infrastructure:**
### Helpful Links
- **SuiteScript 2.0:** https://docs.oracle.com/cd/E60665_01/netsuitecs_gs/NSAPI/NSAPI.pdf
- **SuiteScript Modules:** https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/set_1502135122.html
- **HTML:** https://www.w3schools.com/Tags/default.asp
- **XML:** https://bfo.com/products/report/docs/userguide.pdf
- **FreeMarker:** https://freemarker.apache.org/docs/index.html
- **CSS:** https://www.w3schools.com/cssref/
## Extra Tips
- Choose to execute as the administrator role when deploying the SuiteScripts to make sure everyone has full permissions
- Be sure to check the global permission in all of the saved searches
- Go back to the script deployments to check that their status is "Released" and that their audience includes all roles
- If a user cannot see the Spec Revision chart, check that the user's role has the Notes Tab permission
## Reflection
