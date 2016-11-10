# excelify
A node.js script to create .txt and .xlsx files from Devpost export data for Junction 2016

Running this script against a Devpost export file (.csv) will yield: 

- 1 .txt file containing all of the submissions in a format that you can paste directly into Gavel
- 0-n .xlsx files, one for each prize category featured in the list of submissions. These .xlsx files will contain the full submission data of all teams that registered for a given prize category. If a team has registered for more than one category, they will be present in more than one .xlsx file respectively

# Setup
Paste this into a terminal prompt

`git clone git@github.com:lappalj4/excelify.git && cd excelify && npm install`

To test if it works, run the script against the test.csv file provided: 

`node excelify.js test.csv`

# Usage

To run this against your own .csv file, just paste the file into the excelify folder, and run the command: 

`node excelify.js your_file_name.csv`

If the script completed succesfully, your results will be available in the *results* directory.

# Configuration 
To make this script work against your particular set of submission data, the following configuration options are available: 

in config.json: 

- gavel_title: The name of the field that represents the title of the submission in your .csv file
- gavel_location: The name of the field that represents the table location of the submission in your .csv file
- gavel_description: A list of fields that you want the gavel description of the project to consist of. For example, if you set this to ["Primary Track", "Description"], the resulting description would be printed as:
  Primary Track: [Primary Track]
  Description: [Description]
- prize_category_field: The name of the field in your data that contains what prize categories a team has registered for, e.g. 'Prize Category'
