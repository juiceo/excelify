# excelify
A node.js script to create .txt and .xlsx files from Devpost export data for Junction 2016

Running this script against a Devpost export file (.csv) will yield: 

- 1 .txt, a text file containing all of the submissions in a format that you can paste directly into Gavel
- 0-n .xlsx files, one for each prize category featured in the list of submissions. These .xlsx files will contain the full submission data of all teams that registered for a given prize category. If a team has registered for more than one category, they will be present in more than one .xlsx file respectively

# Setup
Paste this into a terminal prompt

`git clone git@github.com:lappalj4/excelify.git && cd excelify && npm install`

To test if it works, run the script against the test.csv file provided: 

`node excelify.js test.csv`

# Configuration 
To make this script work against your particular set of submission data, the following configuration options are available: 

in config.json: 

- gavel_fields: An array of fields that you would like to include in the gavel export, e.g. ['Team Name', 'Location', 'Description']
- prize_category_field: The name of the field in your data that contains what prize categories a team has registered for, e.g. 'Prize Category'
