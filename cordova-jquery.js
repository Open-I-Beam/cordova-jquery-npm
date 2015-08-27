var path = require("path");
var fs = require("fs");
var vm = require("vm");
var myfile = path.join("www","index.html");
var cheerio = require("cheerio");
var PropertiesReader = require('properties-reader');

//rewriting to use https://www.npmjs.org/package/inquirer
var rl = require('inquirer');

//instantiate the properties reader ...
var properties = PropertiesReader(__dirname + '/text/cordova-jquery-npm.properties');
var builtInTemplates = PropertiesReader(__dirname + '/templates/built-in');

//prompt messages
var sureQuestion = properties.get('text.sureQuestion') ;
var whatNextPrompt = properties.get('text.whatNextPrompt');
var templatePromptMsg = properties.get('text.templatePromptMsg');
var externalPanelPromptMsg = properties.get('text.externalPanelPromptMsg');
var externalPanelPositionPromptMsg = properties.get('text.externalPanelPositionPromptMsg');

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

function includeWWWDependencies(dependencies) {
    var i, wwwPath = path.join("www");
    
    for (i = 0; i < dependencies.length; ++i) {
        fs.writeFileSync(wwwPath + "/" + dependencies[i], fs.readFileSync(__dirname + "/" + dependencies[i]));
    }  
}

function addJQM(fs){
    var content = fs.readFileSync(myfile, 'utf8');
    $ = cheerio.load(content);

    var npmjquery = 'js/jquery-1.11.1.min.js';
    var npmjquerymobile = 'js/jquery-1.5.0.mobile.min.js';
    var npmjquerymobilecss = 'js/jquery-1.5.0.mobile.min.css';

	// Include dependencies ...
	includeWWWDependencies([npmjquery, npmjquerymobile, npmjquerymobilecss]);
	
    var npmjQueryMobileCustomCss = builtInTemplates.get('templates.common.jQMCustomCss');
    var disablejQueryTransition = builtInTemplates.get('templates.common.disablejQueryTransition');    
                                  
    //<link rel="stylesheet" href="js/jquery.mobile.css">
    $("head link[rel='stylesheet']").last().after("\n\t\t<link rel='stylesheet' type='text/css' href='" + npmjquerymobilecss + "' >");
    $("head link[rel='stylesheet']").last().after("\n\t\t<style>" + npmjQueryMobileCustomCss + "\t\t</style>");   
    
    // Fix for tools that include "cordova.js" outside the <body> element.
    $('script[src="cordova.js"]').after('\n        <script type="text/javascript" src="' + npmjquery + '" id="cordova-jquery"></script>');
    
    $('script[id="cordova-jquery"]').after('\n\t\t<script type=\"text/javascript\" id="jqm-trans-disable">' + disablejQueryTransition + '\n\t\t</script>');
    
    $('script[id="jqm-trans-disable"]').after('\n        <script type="text/javascript" src="' + npmjquerymobile + '"></script>');

    fs.writeFileSync(myfile, $.html());

    whatsNext(rl);
}

function templateQuestion(){
     rl.prompt([{
        type: "list",
        name: "template",
        message: templatePromptMsg,
        choices: [ "multiPage", "headerNavbar", "persistentNavbar", "externalPanel", "accordion", "listView", "exit" ]
      }], function( answers ) {
        switch(answers.template) {
        case 'multiPage':
            renderTemplate("templates.multiPage.before-content", "templates.multiPage.after-content", "text.multiPage.doneMsg");
            break;
        case 'persistentNavbar':
            renderTemplate("templates.persistantNavbar.before-content", "templates.persistantNavbar.after-content", "text.persistantNavbar.doneMsg")
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
        case 'accordion':
            renderTemplate("templates.accordion.before-content", "templates.accordion.after-content", "text.accordion.doneMsg")
            break;    
        case 'headerNavbar':
            renderTemplate("templates.headerNavbar.before-content", "templates.headerNavbar.after-content", "text.headerNavbar.doneMsg")
            break;    
        case 'listView':
            renderTemplate("templates.listView.before-content", "templates.listView.after-content", "text.listView.doneMsg")
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
                message: properties.get("text.insertElement"),
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
            message: properties.get("text.keepCodeInquiry"),
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
            message: properties.get("text.codeOverrideWarning"),
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
    var html1 = builtInTemplates.get("templates.externalPanel.before-content");
    var html2 = builtInTemplates.get("templates.externalPanel.after-content").replace("{0}", externalPanelPosition).replace("{1}", revealType);
    var doneMsg = properties.get("text.externalPanel.doneMsg.1") + " " + externalPanelPosition + " " + properties.get("text.externalPanel.doneMsg.2") + " " + revealType + " " + properties.get("text.externalPanel.doneMsg.3");
                var js1 = builtInTemplates.get("templates.externalPanel.behavior");
    insertTemplate(html1, html2, doneMsg, js1);
}

function renderTemplate(beforeContentID, afterContentID, doneMsgID) {
    var html1 = builtInTemplates.get(beforeContentID);
    var html2 = builtInTemplates.get(afterContentID);
    var doneMsg = properties.get(doneMsgID);
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