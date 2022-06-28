# Netsuite-Print-Spec-Button
generates pdf of spec using Netsuite data; sets default values for certain flavors/weight classes using workflows

The workflows were created to set field values based on the checkboxes that were selected in the Netsuite record. I also created "clear presets"
checkboxes to clear the fields.

The javascript files were used to create a custom button that would generate a pdf using the record's information. The javascript rendered the pdf using
Netsuite's advanced pdf/html templates feature.

The html file is the template for the pdf. It uses XML, HTML, CSS, and FreeMarker code to take data from Netsuite and put it in the desired format.
