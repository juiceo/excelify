var Converter = require("csvtojson").Converter;
var converter = new Converter({
	flatKeys: true
});
var colors = require('colors');
var start_date = new Date();
var step_date = new Date();
var fs = require('fs');
var json2xls = require('json2xls');

var _ = require('lodash');


/* Configuration */
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var gavel_title = obj.gavel_title;
var gavel_location = obj.gavel_location;
var gavel_description = obj.gavel_description;
var prize_category = obj.prize_category_field;

var file_path = process.argv[2];

if (file_path == undefined) {
	console.log(colors.red("\nYou must define a path to a .csv file to parse!"));
	console.log("For example: node excelify.js " + colors.yellow("test.csv\n"));
	return;
} else {
	console.log(colors.green.underline("\nReading config:"))
	console.log(" -> File path: " + colors.yellow(file_path));
}

/* Parse file and hand the Json result to a handler function */
converter.on("end_parsed", function (jsonArray) {

   var elapsed = new Date() - start_date;
   console.log("\nParsing done!".underline.green);
   console.log("-> Took " + elapsed + " milliseconds.");

   checkValidity(jsonArray);
   handleResult(jsonArray);
});

require("fs").createReadStream(file_path).pipe(converter);

/* Check the validity of data and print a summary */
function checkValidity(json) {
	console.log("\nResult summary:".underline.green);
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


/* Handle result of parsing and (over)write result files */
function handleResult(json) {
	console.log("\n" + colors.green.underline("Writing result files:"));

	createGavelSubmissionData(json);
	createPrizeCategoryLists(json);

	logAllComplete();
}

/* Create gavel_submissions.txt for pasting into Gavel */
function createGavelSubmissionData(json) {
	step_date = new Date();
	var logger = fs.createWriteStream('./results/gavel_submissions.txt');

	for(var i = 0; i < json.length; i++) {
		console.log("Writing item " + i);
		var obj = json[i];

		var title = obj[gavel_title];
		title = escapeAllTheThings(title);

		var location = obj[gavel_location];
		location = escapeAllTheThings(location);

		var description = "";
		for (var j = 0; j < gavel_description.length; j++) {
			var field = gavel_description[j];
			var item = obj[field];
			if (item != undefined) {
				item = escapeAllTheThings(obj[field]);
			}
			var result = "<b>" + field + "</b>: <br/>" + item + "<br/><br/>";
			description += result;
		}

		logger.write(title + "," + location + "," + description + "\n");
	}

	logger.end();
	logWriteComplete("gavel_submissions.txt", step_date);
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
		var cat = categories[i];
		var catList = _.filter(json, function(o) {
			return (o[prize_category].indexOf(cat) > -1)
		});

		var xls = json2xls(catList);
		cat = cat.replace("/", "-");
		cat = cat.replace(/ /g,'_');
		if (cat == "") {
			cat = "no_category";
		}
		fs.writeFileSync('results/category_' + cat + '.xlsx', xls, 'binary');

		logWriteComplete(".xlsx for " + cat + " with " + colors.green(catList.length) + " rows", step_date); 
	}

}

function escapeAllTheThings(str) {
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
	console.log("-> Results can be found in /results\n\n\n");
}