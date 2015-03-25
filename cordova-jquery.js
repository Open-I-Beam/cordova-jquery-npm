var path = require("path");
var myfile = path.join("www","index.html");
var cheerio = require("cheerio");

//rewriting to use https://www.npmjs.org/package/inquirer
var rl = require('inquirer');

//prompt messages
var sureQuestion = 'Would you like to add jQuery mobile to the current Apache Cordova project?';
var whatNextPrompt = "What would you like to do now that jQuery is enabled?";
var templatePromptMsg = 'Which jQuery mobile template would you like to apply to your Apache Cordova project?';
var externalPanelPromptMsg = 'How would you like the external panel to be revealed?';
var externalPanelPositionPromptMsg = 'What side of the screen would you like the external panel?';

	
function cordovaJQuery() {
	var fs = require('fs');
	
	if(fs.existsSync(myfile) === false) {
		console.log("File does not exist - " + myfile + " you must run cordova-jquery against a valid cordova project within the root directory.  Exiting...");
		return;
	}
	
	var content = fs.readFileSync(myfile, 'utf8');
	$ = cheerio.load(content);
	//check to see if cordova-jquery has already been applied.  If it has alert and close
	if ($('#cordova-jquery').length > 0) {
		whatsNext();
	} else {
		var answer = '';
		rl.prompt([{
			type: "confirm",
			name: "addJQM",
			message: sureQuestion,
			default: true
		}], function( answers ) {
			if ( answers.addJQM === true ){
				addJQM(fs);
			}
		});
	}
}

function addJQM(fs){
	var content = fs.readFileSync(myfile, 'utf8');
	$ = cheerio.load(content);
	if ( process.env.NODE_PATH === undefined || process.env.NODE_PATH === null || process.env.NODE_PATH.length <= 0 ){
		var npmjquery = 'http://code.jquery.com/jquery-1.11.1.js';
		var npmjquerymobile = 'http://code.jquery.com/mobile/git/jquery.mobile-git.js';
		var npmjquerymobilecss = 'http://code.jquery.com/mobile/git/jquery.mobile-git.css';
	} else {
		var npmjquery = 'js/jquery-1.11.1.min.js';
		var npmjquerymobile = 'js/jquery-1.5.0.mobile.min.js';
		var npmjquerymobilecss = 'js/jquery-1.5.0.mobile.min.css';
	}
	
	var npmjQueryMobileCustomCss = '\n\t\t/* For avoiding title truncation in wp8 */' + 
								'\n\t\t.ui-header .ui-title {' + 
								'\n\t\t\t\toverflow: visible !important; ' + 
								'\n\t\t}\n\t\t';
	
	var disablejQueryTransition = '\n\t\t/* For having a faster transition */' +
	                              '\n\t\t$(document).on("mobileinit", function() {' + 
                                  '\n\t\t\t\t$.mobile.defaultPageTransition = "none";' + 
                                  '\n\t\t\t\t$.mobile.defaultDialogTransition = "none";' + 
                                  '\n\t\t\t\t$.mobile.buttonMarkup.hoverDelay = 0;' + 
                                  '\n\t\t});';	
	                              
	//<link rel="stylesheet" href="js/jquery.mobile.css">
	$("head link[rel='stylesheet']").last().after("\n        <link rel='stylesheet' type='text/css' href='" + npmjquerymobilecss + "' >");
	$("head link[rel='stylesheet']").last().after("\n        <style>" + npmjQueryMobileCustomCss + "</style>");	
	$('body script[type="text/javascript"]').last().after('\n        <script type="text/javascript" src="' + npmjquery + '" id="cordova-jquery"></script>');
	$('body script[type="text/javascript"]').last().after('\n\t\t<script type=\"text/javascript\">' + disablejQueryTransition + '\n\t\t</script>');	
	$('body script[type="text/javascript"]').last().after('\n        <script type="text/javascript" src="' + npmjquerymobile + '"></script>');

	fs.writeFileSync(myfile, $.html());

	whatsNext(rl);

	if ( process.env.NODE_PATH === undefined || process.env.NODE_PATH === null || process.env.NODE_PATH.length <= 0 ){
		console.log('The local NODE_PATH environment variable is not set.  Therefore, we are pointing to the latest CDN version of jQuery mobile');
	} else {
		var npmjquery = path.resolve(__dirname,'js','jquery-1.11.1.min.js');
		var npmjquerymobile = path.resolve(__dirname,'js','jquery-1.5.0.mobile.min.js');
		var npmjquerymobilecss = path.resolve(__dirname,'js','jquery-1.5.0.mobile.min.css');

		var rs = fs.createReadStream(npmjquery);
		rs.pipe(fs.createWriteStream('www/js/jquery-1.11.1.min.js'));


		rs = fs.createReadStream(npmjquerymobile);
		rs.pipe(fs.createWriteStream('www/js/jquery-1.5.0.mobile.min.js'));


		rs = fs.createReadStream(npmjquerymobilecss);
		rs.pipe(fs.createWriteStream('www/js/jquery-1.5.0.mobile.min.css'));
	}

}

function templateQuestion(){
	 rl.prompt([{
		type: "list",
		name: "template",
		message: templatePromptMsg,
		choices: [ "multiPage","persistentNavbar","externalPanel","exit" ]
	  }], function( answers ) {
		switch(answers.template) {
		case 'multiPage':
			multiPage();
			break;
		case 'persistentNavbar':
			persistantNavbar();
			break;
		case 'externalPanel':
			//ask the user what type of reveal to display the panel
			rl.prompt([{
				type: "list",
				name: "position",
				message: externalPanelPositionPromptMsg,
				choices: [ "left","right" ]
			}, {
				type: "list",
				name: "reveal",
				message: externalPanelPromptMsg,
				choices: [ "push","overlay","reveal" ]
			}], function( answers ) {
				externalPanel(answers.reveal, answers.position);
			});
			break;
		default:
			console.log('Okay, exiting.');
			break;
		} //end switch
	});
}

function whatsNext() {
	 rl.prompt([{
		type: "list",
		name: "next",
		message: whatNextPrompt,
		choices: [ "applyTemplate","insertElement","exit" ]
	}], function( answers ) {
		switch(answers.next) {
		case 'applyTemplate':
			templateQuestion();
			break;
		case 'insertElement':
			rl.prompt([{
				type: "input",
				name: "elid",
				message: "What is the id of the parent element you'd like to insert this jQuery mobile element as a child of?",
				default: "deviceready"
			  }], function(res){
				//then based on that we can ask what type of element to add
				insertPopup(res.elid);
			});
			break;
		default:
			console.log('Okay, exiting.');
			break;
		} // end switch
	});
}

function insertTemplate(html1, html2, doneMsg, js1){
	//data-display="push"
	//data-position="left"
	var fs = require('fs');
	var content = fs.readFileSync(myfile, 'utf8');
	$ = cheerio.load(content);
	var bodychildren = "<p>Page 1 content goes here</p>"; //not doing this for now
	//save old content if no elements have the id page1
	if ($('#page1').length === 0){
		rl.prompt([{
			type: "confirm",
			name: "keepCode",
			message: "Would you like to keep the current code?  ...it could get ugly!",
			default: false
		}], function( answers ) {
			if ( answers.keepCode === true ){
				bodychildren = $('body').clone().find("script").remove().end().html().trim();
			}
			doIt(fs, bodychildren, content, html1, html2, doneMsg, js1);
		});
	} else {
		rl.prompt([{
			type: "confirm",
			name: "continue",
			message: "WARNING: continuing will override the code in index.html",
			default: false
		}], function( answers ) {
			if ( answers.continue === false ){
				console.log("Okay, exiting");
				return;
			}
			doIt(fs, bodychildren, content, html1, html2, doneMsg, js1);
		});
	}
}

function doIt(fs, bodychildren, content, html1, html2, doneMsg, js1){
	//console.log('got the bodychildren: ' + bodychildren);
	$ = cheerio.load(content);
	$('body').find('div').remove();
	$('.jsdom').remove();

	//remove all comments
	$('body').contents().each(function() {
		if (this.nodeType == 8 || this.nodeType == 3){
			$(this).remove();
		}
	});

	$('body').prepend(html1 + bodychildren + html2);

	//add javascript to initialize the panel
	if (js1 !== ''){
		if ($('#paneljs').length === 0){
			$('body script[type="text/javascript"]').last().after(js1);
		}
	} else {
		//remove the js from other templates if they exist
		$('#paneljs').remove();
	}

	fs.writeFileSync(myfile,$.html());
	console.log(doneMsg);
}

function externalPanel(revealType, externalPanelPosition){
	//data-display="push"
	//data-position="left"
	var html1 = '\n\t\t<!-- page 1 -->\n\t\t<div data-role="page" id="page1">\n\t\t\t<div data-role="header">\n\t\t\t\t<h1>Header</h1>\n\t\t\t</div><!-- /header -->\n\t\t\t\n\t\t\t<div class="ui-content">\n\t\t\t\t';
	var html2 = '\n\t\t\t\t<a href="#panel">Open panel</a>\n\t\t\t</div><!-- /content -->\n\t\t</div><!-- /page -->\n\t\t\n\t\t<!-- panel to reveal -->\n\t\t<div data-role="panel" id="panel" data-position="' + externalPanelPosition + '" data-display="' + revealType + '" data-theme="a">\n\t\t\t<p>Place panel content here</p>\n\t\t\t<a href="#close" data-rel="close">Close</a>\n\t\t</div><!-- /panel -->\n';
	var doneMsg = "Done injecting left external Panel on the " + externalPanelPosition + " side revealed using " + revealType + " as a jquery mobile template";
				var js1 = '\n        <script id="paneljs">\n\t\t$(function() {\n\t\t\ttry{$( "body>[data-role=\'panel\']" ).panel();}catch(e){}\n\t\t});\n        </script>';
	insertTemplate(html1, html2, doneMsg, js1);
}

function multiPage(){
	var html1 = '\n\t\t<!-- jquery mobile page 1 -->\n\t\t<div data-role="page" id="page1">\n\t\t\t<div data-role="header">\n\t\t\t\t<h1>Page 1</h1>\n\t\t\t</div>\n\n\t\t\t<div role="main" class="ui-content">\n\t\t\t\t';
	var html2 = '\n\t\t\t\t\t<a href="#page2">Goto page2</a>\n\t\t\t\n\t\t</div>\n\t\t\t<!-- end of page 1 content -->\n\n\t\t\t<div data-role="footer" data-position="fixed">\n\t\t\t\t<h4>Page 1 Footer</h4>\n\t\t\t</div>\n\t\t\t<!-- end page 1 footer -->\n\t\t</div>\n\t\t<!-- end page 1 -->\n\n\t\t<!-- jquery mobile page 2 -->\n\t\t<div data-role="page" id="page2">\n\t\t\t<div data-role="header">\n\t\t\t\t<h1>Page 2</h1>\n\t\t\t</div>\n\n\t\t\t<div role="main" class="ui-content">\n\t\t\t\t<h4>Page 2 content goes here</h4>\n\t\t\t\t<a href="#page1">Goto page1</a>\n\t\t\t</div>\n\t\t\t<!-- end of page 2 content -->\n\n\t\t\t<div data-role="footer" data-position="fixed">\n\t\t\t\t<h4>Page 2 Footer</h4>\n\t\t\t</div>\n\t\t\t<!-- end page 2 footer -->\n\t\t</div>\n\t\t<!-- end page 2 -->\n';
	var doneMsg = "Done injecting single page jquery mobile template";
	var js1 = '';
	insertTemplate(html1, html2, doneMsg, js1);
}

function persistantNavbar(){
	var html1 = '\n\t\t<!-- page 1 -->\n\t\t<div data-role="page" id="page1">\n\t\t\t<div data-role="header">\n\t\t\t\t<h1>Page 1</h1>\n\t\t\t</div>\n\t\t\t\n\t\t\t<div class="ui-content">\n\t\t\t\t';
	var html2 = '\n\t\t\t</div><!-- end page 1 content -->\n\t\t\t\n\t\t\t<div data-role="footer" data-position="fixed">\n\t\t\t\t<div data-role="navbar">\n\t\t\t\t\t<ul>\n\t\t\t\t\t\t<li><a href="#page1" class="ui-btn-active ui-state-persist">Page 1</a></li>\n\t\t\t\t\t\t<li><a href="#page2">Page 2</a></li>\n\t\t\t\t\t\t<li><a href="#page3">Page 3</a></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</div><!-- /navbar -->\n\t\t\t</div><!-- /footer -->\n\t\t</div><!-- /page1 -->\n\n\t\t\t\t<!-- page 2 -->\n\t\t<div data-role="page" id="page2">\n\t\t\t<div data-role="header">\n\t\t\t\t<h1>Page 2</h1>\n\t\t\t</div>\n\t\t\t\n\t\t\t<div class="ui-content">\n\t\t\t\t<p>This is page 2</p>\n\t\t\t</div><!-- end page 2 content -->\n\t\t\t\n\t\t\t<div data-role="footer" data-position="fixed">\n\t\t\t\t<div data-role="navbar">\n\t\t\t\t\t<ul>\n\t\t\t\t\t\t<li><a href="#page1">Page 1</a></li>\n\t\t\t\t\t\t<li><a href="#page2" class="ui-btn-active ui-state-persist">Page 2</a></li>\n\t\t\t\t\t\t<li><a href="#page3">Page 3</a></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</div><!-- /navbar -->\n\t\t\t</div><!-- /footer -->\n\t\t</div><!-- /page2 -->\n\t\t\n\t\t\t\t<!-- page 3 -->\n\t\t<div data-role="page" id="page3">\n\t\t\t<div data-role="header">\n\t\t\t\t<h1>Page 3</h1>\n\t\t\t</div>\n\t\t\t\n\t\t\t<div class="ui-content">\n\t\t\t\t<p>This is page 3</p>\n\t\t\t</div><!-- end page 3 content -->\n\t\t\t\n\t\t\t<div data-role="footer" data-position="fixed">\n\t\t\t\t<div data-role="navbar">\n\t\t\t\t\t<ul>\n\t\t\t\t\t\t<li><a href="#page1">Page 1</a></li>\n\t\t\t\t\t\t<li><a href="#page2">Page 2</a></li>\n\t\t\t\t\t\t<li><a href="#page3" class="ui-btn-active ui-state-persist">Page 3</a></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</div><!-- /navbar -->\n\t\t\t</div><!-- /footer -->\n\t\t</div><!-- /page3 -->\n';
	var doneMsg = "Done injecting persistent navbar jquery mobile template";
	var js1 = '';
	insertTemplate(html1, html2, doneMsg, js1);
}

function insertPopup(elementId){
	insertElement(elementId,'<div data-role="popup" id="jpop"><p>Hello from a popup</p></div><a href="#jpop" data-rel="popup">Open popup</a>');
}

function insertElement(elementId, elementHTML){
	var fs = require('fs');
	var content = fs.readFileSync(myfile, 'utf8');
	$ = cheerio.load(content);
	$('.jsdom').remove();
		
	if ($('#' + elementId).length === 0){
		console.log('There was no element with the id ' + elementId + ' therefore no new element has been added');
		return;
	}
	$('#' + elementId).prepend(elementHTML);

	fs.writeFileSync(myfile, $.html());
}

exports.init = cordovaJQuery;