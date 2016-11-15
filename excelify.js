var Converter = require("csvtojson").Converter;
var colors = require('colors');
var start_date = new Date();
var step_date = new Date();
var fs = require('fs');
var json2xls = require('json2xls');

var _ = require('lodash');


/* Configuration */
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var gavel_title = conf.gavel_title;
var gavel_location = conf.gavel_location;
var gavel_description = conf.gavel_description;
var prize_category = conf.prize_category_field;
var excel_fields = conf.excel_fields;
var excel_sort_by = conf.excel_sort_by;
var judge_csv_name = conf.judge_csv_name;
var judge_csv_email = conf.judge_csv_email;
var judge_csv_description = conf.judge_csv_description;
var path_to_submissions = conf.path_to_submissions;
var path_to_judges = conf.path_to_judges;

/* Run everything */
var submissionsParsed = parseSubmissionData(path_to_submissions);
var judgesParsed = parseJudgeData(path_to_judges);

setTimeout(function() {
	logAllComplete();
}, 500);

function parseSubmissionData(path_to_submissions) {

	step_date = new Date();

	/* Check if the path to the submission file is defined */
	if (path_to_submissions == undefined) {
		console.log(colors.red("\nYou must define a path to a Devpost export file (.csv)!"));
		console.log("In config.json, edit the path_to_submissions parameter to the path of your Devpost export file\n-> For example: " + colors.yellow("path_to_submission: ./data/submissions.csv\n\n"));
		return false;
	}
	
	console.log(colors.green.underline("\nReading submission data:"));
	console.log(" -> File path: " + colors.yellow(path_to_submissions));

	var converter = new Converter({
		flatKeys: true
	});

	/* If the path is defined, parse the file and hand the result to the handler function */
	converter.on("end_parsed", function (jsonArray) {

	   var elapsed = new Date() - step_date;
	   console.log("\nParsing done!".underline.green);
	   console.log("-> Took " + elapsed + " milliseconds.");

	   console.log("\nSubmissions summary:".underline.green);
	   checkDataValidity(jsonArray);
	   
	   console.log("\n" + colors.green.underline("Writing submission result files:"));
	   createGavelSubmissionData(jsonArray);
	   createPrizeCategoryLists(jsonArray);
	});

	fs.createReadStream(path_to_submissions).pipe(converter);
	return true;
}

function parseJudgeData(path_to_judges) {

	step_date = new Date();

	/* Check if the path to the judges file is defined */
	if (path_to_judges == undefined) {
		console.log(colors.red("\nYou must define a path to judge list to parse (.csv)!"));
		console.log("In config.json, edit the path_to_judges parameter to the path of your judge list (.csv) \n-> For example: " + colors.yellow("path_to_judges: ./data/judges.csv\n\n"));
		return false;
	}
	
	console.log(colors.green.underline("\nReading judge data:"));
	console.log(" -> File path: " + colors.yellow(path_to_judges));

	var converter = new Converter({
		flatKeys: true
	});

	converter.on("end_parsed", function (jsonArray) {

	   var elapsed = new Date() - step_date;
	   console.log("\nParsing done!".underline.green);
	   console.log("-> Took " + elapsed + " milliseconds.");

	   console.log("\Judges summary:".underline.green);
	   checkDataValidity(jsonArray);
	   createJudgeCsv(jsonArray);
	});

	fs.createReadStream(path_to_judges).pipe(converter);
	return true;
}

/* Check the validity of the given data and print a summary */
function checkDataValidity(json) {
	console.log("-> Total items: %s", colors.green(json.length));

	var keyset = Object.keys(json[0]);
	console.log("-> Fields: %s", colors.green(keyset.length));


	console.log("Fields:");
	for (var i = 0; i < keyset.length; i++) {
		var key = keyset[i];
		var count = 0;
		for (var j = 0; j < json.length; j++) {
			if (json[j][key] != undefined) {
				count++;
			}
		}
		if (count < json.length) {
			console.log("-> " + key + ": " + colors.red(count + "/" + json.length));
		} else if (count > json.length) {
			console.log("-> " + key + ": " + colors.yellow(count + "/" + json.length));
		} else {
			console.log("-> " + key + ": " + colors.green(count + "/" + json.length));
		}
	}
}

/* Create gavel_submissions.txt for pasting into Gavel */
function createGavelSubmissionData(json) {
	step_date = new Date();
	var logger = fs.createWriteStream('./results/gavel_submissions.txt');

	for(var i = 0; i < json.length; i++) {
		var obj = json[i];

		var title = obj[gavel_title];
		title = escapeAllTheThings(title);

		var location = obj[gavel_location];
		location = escapeAllTheThings(location);

		var description = "";
		for (var j = 0; j < gavel_description.length; j++) {
			var field = gavel_description[j];
			var value = escapeAllTheThings(obj[field]);
			var result = "<b>" + field + "</b>: <br/>" + value + "<br/><br/>";
			description += result;
		}

		logger.write(title + "," + location + "," + description + "\n");
	}

	logger.end();
	logWriteComplete("gavel_submissions.txt", step_date);
}

function createJudgeCsv(json) {
	step_date = new Date();
	var logger = fs.createWriteStream('./results/gavel_judges.txt');

	for(var i = 0; i < json.length; i++) {
		var obj = json[i];

		var name = obj[judge_csv_name];
		name = escapeAllTheThings(name);

		var email = obj[judge_csv_email];
		email = escapeAllTheThings(email);

		var description = obj[judge_csv_description];
		description = escapeAllTheThings(description);

		logger.write(name + "," + email + "," + description + "\n");
	}

	logger.end();
	logWriteComplete("gavel_judges.txt", step_date);
}

/* Filter the data by prize categories */
function createPrizeCategoryLists(json) {
	console.log("")
	
	/* First, get a list of all existing prize categories */
	var categories = []; 

	for (var i = 0; i < json.length; i++) {
		var obj = json[i];
		var cats = obj[prize_category].split(',');

		for (var j = 0; j < cats.length; j++) {
			var cat = cats[j]; 
			if (categories.indexOf(cat) < 0) {
				categories.push(cat.trim());
			}
		}
	}

	/* Filter the json by prize category and create .xlsx files for each one */
	for (var i = 0; i < categories.length; i++) {
		step_date = new Date();

		/* Filter the dataset for only the current category */
		var cat = escapeAllTheThings(categories[i]);
		var catList = _.filter(json, function(o) {
			return (o[prize_category].indexOf(cat) > -1)
		});

		catList = _.sortBy(catList, function(o) {
			return (o[excel_sort_by]);	
		})

		var options = {
			fields: excel_fields
		}

		var xls = json2xls(catList, options);
		cat = cat.replace("/", "-");
		cat = cat.replace(/ /g,'_');
		cat = cat.toLowerCase();
		if (cat == "") {
			cat = "no_category";
		}
		fs.writeFileSync('results/category_' + cat + '.xlsx', xls, 'binary');

		logWriteComplete(".xlsx for " + cat + " with " + colors.green(catList.length) + " rows", step_date); 
	}

}

function escapeAllTheThings(str) {
	if (str == undefined) {
		return str;
	}

	str = String(str);
	str = escapeLineBreaks(str);
	str = escapeDoubleQuotes(str);
	str = escapeCommas(str);
	return str;
}
 
/* Replace all double quotes in a string with the corresponding HTML character code */
function escapeDoubleQuotes(str) {
	return str.replace(/\\([\s\S])|(")/g,"&#34;"); // thanks @slevithan!
}

/* Replace all line breaks in a string with a HTML linebreak character */
function escapeLineBreaks(str) {
	return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
}

/* Replace all commas in a string with the corresponding HTML character code */
function escapeCommas(str) {
	var regex = new RegExp(',', 'g');
	return str.replace(regex, '&#44;');
}

function logWriteComplete(name, step_date) {
	console.log(colors.green("OK") + " Wrote " + name + " ( " + (new Date() - step_date) + " ms )");
}

function logAllComplete() {
	console.log(colors.green.underline("\n\nWriting files complete!"));
	console.log("-> Total time elapsed: " + (new Date() - start_date) + " ms");
	console.log("Submissions: " + submissionsParsed + ", judges: " + judgesParsed);
	console.log("-> Results can be found in /results\n\n\n");
}