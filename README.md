# Netsuite-Print-Spec-Button
Generates pdf of spec using Netsuite data; includes bill of materials for the product

The javascript files were used to create a custom button that would generate a pdf using the record's information. The javascript rendered the pdf using
Netsuite's advanced pdf/html templates feature. I used multiple suitelets to get all the components of the bill of materials, without any assemblies, to add to the template.

The html file is the template for the pdf. It uses XML, HTML, CSS, and FreeMarker code to take data from Netsuite and put it in the desired format.
