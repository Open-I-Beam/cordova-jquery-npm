cordova-jquery
==============

npm module to add jQuery mobile to an existing Apache Cordova hybrid mobile application.

jQuery version
===============

The version of jQuery for this release is version 1.11.1.
The version of jQuery mobile for this release is version 1.5.0.

Running
==============

To add jQuery mobile to your existing Apache Cordova application simply move into the root directory of your Apache Cordova project and run

    cordova-jquery

Once a project is initialized to use jQuery mobile three files will be moved into your Cordova project js directory:

1. jquery.min.js
2. jquery.mobile.min.js
3. jquery.mobile.min.css

Additionally, these files will be referenced from your Cordova index.html file.

Applying jQuery Templates
==============

Once the project is initialized, the module will prompt asking if you'd like to apply a jQuery mobile template.  Additionally, you could re-run the corodova-jquery command on a project already initialized to apply a template after the fact.  Current templates include:

## multiple pages
This template will apply a simple two page jQuery mobile template to your index.html file.  

![First](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/multipage1.jpg)
![Second](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/multipage2.jpg)

## header navbar
This template will apply a three page jQuery mobile template to your index.html file that includes a header navbar for the header on each page.

![First](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/headerNavBar1.jpg)
![Second](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/headerNavBar2.jpg)

## persistent navbar
This template will apply a three page jQuery mobile template to your index.html file that includes a persistent navbar for the footer on each page.

![First](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/pnav1.jpg)
![Second](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/pnav2.jpg)

## external panel
This template will apply an external panel to jQuery mobile.  When this option is selected you will also be prompted for additional information such as which side of the page you'd like the panel to open on (left, right) and which reveal style would you like (reveal, push, overlay)

![First](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/panel1.jpg)
![Second](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/panel2.jpg)

## accordion
This template will apply three sections' jQuery mobile accordion template to your index.html file. Your existing content will be placed as part of the first section. It is important to note that you have to make sure that your existing content parent element does not use CSS "absolute" position in order to be controlled by the accordion section.

![First](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/section.jpg)

## list view
This template will apply a jQuery mobile list view template to your index.html file. The first item of the list view points to your existing content page, and the second and the third items of the list view point to two placeholder pages.

![First](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/ListView1.jpg)
![Second](https://raw.githubusercontent.com/Open-I-Beam/cordova-jquery-npm/master/figures/ListView2.jpg)

WARNING
==============

In this version of the module, any existing code within the index.html body tag will be REMOVED when applying a new template.  However, It is not removed if you simply initiate the jQuery mobile use.

Adding jQuery Elements
==============

Once the project is initialized, the module will prompt asking if you'd like to add a jQuery mobile element.  Additionally, you could re-run the corodova-jquery command on a project already initialized to add an element after the fact.  Current elements include:

## Popup
This element adds a jQuery mobile popup.

How to test from GitHub rather than install through npm
=================
First install using the npm command

	npm install -g /path/to/cordova-jquery
	
ex.

	npm install -g ../../cordova-jquery
	
Verify that it is installed by running

	npm ls
	
You will see the name and the version of the npm module
For example,
├── cordova-jquery@0.1.2

	
To test.  First move into an Apache Cordova project directory.  Then run

	node /path/to/cordova-jquery/cordova-jquery
	
ex.

	node ../../cordova-jquery/cordova-jquery