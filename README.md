# excelify
A node.js script to create .txt and .xlsx files from Devpost export data for Junction 2016

Running this script against a Devpost export file (.csv) will yield: 

- gavel_submissions.txt, a text file containing all of the submissions in a format that you can paste into Gavel
- 0-n .xlsx files, one for each prize category featured in the list of submissions. These .xlsx files will contain the full submission data of all teams that registered for a given prize category. If a team has registered for more than one category, they will be present in more than one .xlsx file respectively
