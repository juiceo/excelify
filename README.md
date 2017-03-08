# excelify
A node.js script to create .txt and .xlsx files from Devpost export data, created for Junction 2016. The purpose of this script is to simplify and automate the process of moving data from Devpost to Gavel, so that no one needs to manually do this stuff at the event on game day.

Running this script against a Devpost export file (.csv) will yield: 

- 1 .txt file containing all of the submissions in a format that you can paste directly into Gavel
- 0-n .xlsx files, one for each prize category featured in the list of submissions. These .xlsx files will contain the full submission data of all teams that registered for a given prize category. If a team has registered for more than one category, they will be present in more than one .xlsx file respectively

Also, provided with a .csv file containing judge information, this script can create a .txt file that you can also copy-paste directly into Gavel (see configuration).

# Setup & Usage
- Install 

`git clone git@github.com:lappalj4/excelify.git && cd excelify && npm install`

- Move your Devpost export file and judge data into the **data** folder
- Edit the config.json file according to your needs (instructions below)

Run the script by typing the following command:

`node excelify`

If the script completed successfully, your results will be available in the **results** directory.

# Configuration 

This script can take as input 

- 1 Devpost export file, which you can get from the admin page of your hackathon in Devpost, under metrics (.csv)
- 1 judge data file, which you can export from e.g. Google forms or wherever you are collecting judge submissions (.csv)

To make this script work against your particular set of submission data, the following configuration options are available in config.json:

- path_to_submissions: The path to your Devpost export file (Leave blank if you don't have one)
- path_to_judges: The path to your judge data file (Leave blank if you don't have one)
- gavel_title: The name of the field that represents the title of the submission in your .csv file
- gavel_location: The name of the field that represents the table location of the submission in your .csv file
- gavel_description: A **list** of fields that you want the gavel description of the project to consist of
- prize_category_field: The name of the field in your data that contains what prize categories a team has registered for
- excel_fields: A **list** of the fields to include in the prize category excels. Each field will be a column in the resulting .xlsx file
- excel_sort_by: The name of the field by which to sort the above excels
- judge_csv_name: The field in your judge data that contains the name of the judge
- judge_csv_email: The field in your judge data that contains the email address of the judge
- judge_csv_description: The field in your judge data that you wish to set as the description for your judges
