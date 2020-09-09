//=============================================================================
//
// File:         /node_modules/rwt-storyboard/rwt-storyboard.js
// Language:     ECMAScript 2015
// Copyright:    Read Write Tools © 2020
// License:      MIT
// Initial date: Sep 7, 2020
// Purpose:      Timed sequence of panels that tell a story
//
//=============================================================================

const Static = {
	componentName:    'rwt-storyboard',
	elementInstance:  1,
	htmlURL:          '/node_modules/rwt-storyboard/rwt-storyboard.blue',
	cssURL:           '/node_modules/rwt-storyboard/rwt-storyboard.css',
	htmlText:         null,
	cssText:          null
};

Object.seal(Static);

export default class RwtStoryboard extends HTMLElement {

	constructor() {
		super();
		
		// guardrails
		this.instance = Static.elementInstance++;
		this.isComponentLoaded = false;

		// child elements
		this.frame = null;
		this.controller = null;
		this.panels = new Array();		// all <section> elements
		this.buttons = new Array();		// all controller <button> elements
		
		// properties
		this.previousPanel = null;		// the panel losing visibility
		this.currentPanel = null;		// the panel gaining visibility
		this.currentPanelIndex = -1;	// index of 'currentPanel' within 'this.panels'
		this.timer = null;
		this.honorInitialDelay = true;	// true only before the sequencer starts the first time
		this.userSuspended = false;		// true when user clicks inside frame or on a controller button		
		
		this.initialDelay = 0;			// CSS var(--initial-delay) in milliseconds
		this.sequenceTime = 0;			// CSS var(--sequence-time) in milliseconds
		this.holdTime = 0;				// CSS var(--hold-time) in milliseconds
		
		Object.seal(this);
	}
	
	//-------------------------------------------------------------------------
	// customElement life cycle callback
	//-------------------------------------------------------------------------
	async connectedCallback() {		
		if (!this.isConnected)
			return;
		
		try {
			var htmlFragment = await this.getHtmlFragment();
			var styleElement = await this.getCssStyleElement();

			var fragmentWithSections = await this.fetchPanels();
			if (fragmentWithSections != null) {
				var elFrame = htmlFragment.getElementById('frame');
				elFrame.appendChild(fragmentWithSections);
			}

			this.attachShadow({mode: 'open'});
			this.shadowRoot.appendChild(htmlFragment); 
			this.shadowRoot.appendChild(styleElement); 
			
			this.identifyChildren();
			this.createControllerButtons();
			this.readTimingVariables();
			this.registerEventListeners();
			this.registerIntersectionObserver();
			this.showFirstPanel();
			this.sendComponentLoaded();
		}
		catch (err) {
			console.log(err.message);
		}
	}
	
	//-------------------------------------------------------------------------
	// initialization
	//-------------------------------------------------------------------------

	// Only the first instance of this component fetches the HTML text from the server.
	// All other instances wait for it to issue an 'html-template-ready' event.
	// If this function is called when the first instance is still pending,
	// it must wait upon receipt of the 'html-template-ready' event.
	// If this function is called after the first instance has already fetched the HTML text,
	// it will immediately issue its own 'html-template-ready' event.
	// When the event is received, create an HTMLTemplateElement from the fetched HTML text,
	// and resolve the promise with a DocumentFragment.
	getHtmlFragment() {
		return new Promise(async (resolve, reject) => {
			var htmlTemplateReady = `${Static.componentName}-html-template-ready`;
			
			document.addEventListener(htmlTemplateReady, () => {
				var template = document.createElement('template');
				template.innerHTML = Static.htmlText;
				resolve(template.content);
			});
			
			if (this.instance == 1) {
				var response = await fetch(Static.htmlURL, {cache: "no-cache", referrerPolicy: 'no-referrer'});
				if (response.status != 200 && response.status != 304) {
					reject(new Error(`Request for ${Static.htmlURL} returned with ${response.status}`));
					return;
				}
				Static.htmlText = await response.text();
				document.dispatchEvent(new Event(htmlTemplateReady));
			}
			else if (Static.htmlText != null) {
				document.dispatchEvent(new Event(htmlTemplateReady));
			}
		});
	}
	
	// Use the same pattern to fetch the CSS text from the server
	// When the 'css-text-ready' event is received, create an HTMLStyleElement from the fetched CSS text,
	// and resolve the promise with that element.
	getCssStyleElement() {
		return new Promise(async (resolve, reject) => {
			var cssTextReady = `${Static.componentName}-css-text-ready`;

			document.addEventListener(cssTextReady, () => {
				var styleElement = document.createElement('style');
				styleElement.innerHTML = Static.cssText;
				resolve(styleElement);
			});
			
			if (this.instance == 1) {
				var response = await fetch(Static.cssURL, {cache: "no-cache", referrerPolicy: 'no-referrer'});
				if (response.status != 200 && response.status != 304) {
					reject(new Error(`Request for ${Static.cssURL} returned with ${response.status}`));
					return;
				}
				Static.cssText = await response.text();
				document.dispatchEvent(new Event(cssTextReady));
			}
			else if (Static.cssText != null) {
				document.dispatchEvent(new Event(cssTextReady));
			}
		});
	}

	//^ Fetch the user-specified panels from the file specified in
	//  the custom element's sourceref attribute, which is a URL.
	//
	//  That file should contain HTML with <section> elements, which may contain
	//  anything as long as it fits within the --width and --height of the frame
	//
	//< returns a document-fragment suitable for appending to the component's 'quickpicMenu' element
	//< returns null if the user has not specified a sourceref attribute or
	//  if the server does not respond with 200 or 304
	async fetchPanels() {
		if (this.hasAttribute('sourceref') == false)
			return null;
		
		var sourceref = this.getAttribute('sourceref');

		var response = await fetch(sourceref, {cache: "no-cache", referrerPolicy: 'no-referrer'});		// send conditional request to server with ETag and If-None-Match
		if (response.status != 200 && response.status != 304)
			return null;
		var templateText = await response.text();
		
		// create a template and turn its content into a document fragment
		var template = document.createElement('template');
		template.innerHTML = templateText;
		return template.content;
	}

	//^ Identify this component's children
	identifyChildren() {
		this.frame = this.shadowRoot.getElementById('frame');
		this.controller = this.shadowRoot.getElementById('controller');
		var sections = this.shadowRoot.querySelectorAll('section');
		for (let section of sections)
			this.panels.push(section);
	}		

	//^ Create a controller button for each section declared by the user
	createControllerButtons() {
		for (let i=0; i < this.panels.length; i++) {
			var panel = this.panels[i];
			var button = document.createElement('button');
			button.innerText = '●';
			button.setAttribute('type', 'button');
			button.storyboardPanel = panel;				// extend the DOM element to have a reference to the panel associated with this button
			button.panelIndex = i;						// extend the DOM element to have an index into the array of panels
			this.controller.appendChild(button);
			this.buttons.push(button);					// this indexing of this array is the same as the indexing of this.panels
		}
	}
	
	//^ Convert CSS variable values into local component values
	readTimingVariables() {
		this.initialDelay = this.getCSSTimeVariable('--initial-delay');
		this.sequenceTime = this.getCSSTimeVariable('--sequence-time');
		this.holdTime = this.getCSSTimeVariable('--hold-time');
	}

	//^ Listen for clicks on frame and controller buttons
	registerEventListeners() {
		this.frame.addEventListener('click', this.onClickFrame.bind(this));
		
		var buttons = this.shadowRoot.querySelectorAll('#controller button');
		for (let button of buttons)
			button.addEventListener('click', this.onClickButton.bind(this));
	}

	//^ Start the panel sequence when the frame is fully within the viewport
	//  Suspend the panel sequence when the frame is fully outside the viewport
	registerIntersectionObserver() {
		var intersectionObserver = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting == true) {
				if (entries[0]['intersectionRatio'] == 1) 			// fully visible
					this.startSequence();
				else 												// partially visible
					this.suspendSequence();
			}
			else  // (entries[0].isIntersecting == false)			// fully invisible
				this.suspendSequence();
			
		}, { threshold: [0, 1] });
	
		intersectionObserver.observe(this.frame);
	}

	//^ Inform the document's custom element that it is ready for programmatic use 
	sendComponentLoaded() {
		this.isComponentLoaded = true;
		this.dispatchEvent(new Event('component-loaded', {bubbles: true}));
	}

	//^ A Promise that resolves when the component is loaded
	waitOnLoading() {
		return new Promise((resolve) => {
			if (this.isComponentLoaded == true)
				resolve();
			else
				this.addEventListener('component-loaded', resolve);
		});
	}	
	
	//-------------------------------------------------------------------------
	// component events
	//-------------------------------------------------------------------------

	// User has clicked somewhere within the custom element
	// suspend/resume sequence
	onClickFrame(event) {
		// if the sequence is running, suspend it
		if (this.timer != null) {
			this.userSuspended = true;
			this.suspendSequence();
		}
		else if (this.honorInitialDelay == true) {
			// clicking within frame during the initial delay does nothing
		}
		// if the sequence is suspended, restart it
		else {
			this.userSuspended = false;
			this.startSequence();
		}
		
		event.stopPropagation();
	}

	// User has clicked a controller button
	// show associated panel and suspend sequence
	onClickButton(event) {
		this.userSuspended = true;
		this.suspendSequence();
		var button = event.target;
		var animate = false;
		this.showPanel(button.storyboardPanel, button, animate);
		this.currentPanelIndex = button.panelIndex;
		event.stopPropagation();
	}

	//-------------------------------------------------------------------------
	// component methods
	//-------------------------------------------------------------------------
	
	// call this during initialization
	showFirstPanel() {
		if (this.panels.length == 0)
			return;
		else {
			var animate = false;
			this.showPanel(this.panels[0], this.buttons[0], false);
			this.currentPanelIndex = 0;
		}
	}
	
	//> Show one panel, hide the others
	//> panelToActivate is one of the <section> elements
	//> buttonToActivate is the button corresponding to the panel
	//> animate is true when sequencing, false under user control
	showPanel(panelToActivate, buttonToActivate, animate) {
		if (panelToActivate == this.currentPanel)
			return;
		
		this.previousPanel = this.currentPanel;
		this.currentPanel = panelToActivate;
 
		for (let panel of this.panels) {
			if (panel == this.previousPanel) {
				if (animate == true) {
					var animations = panel.getAttribute('data-prev');
					panel.className = `${animations} show`;
				}
				else
					panel.className = 'hide';
			}
			else if (panel == this.currentPanel) {
				if (animate == true) {
					var animations = panel.getAttribute('data-next');
					panel.className = `${animations} show`;
				}
				else
					panel.className = 'show';
			}
			else {
				panel.className = 'hide';
			}				
		}

		for (let button of this.buttons) {
			if (button == buttonToActivate)
				button.className = `current-panel`;
			else
				button.className = '';
		}
	}

	startSequence() {
		// the first time startSequence is called, honor the initial delay
		if (this.honorInitialDelay == true) {
			this.honorInitialDelay = false;
			window.setTimeout(this.beginSequenceNow.bind(this), this.initialDelay);
		}
		// every other time startSequence is called, begin the sequence now
		else
			this.beginSequenceNow();
	}
	
	beginSequenceNow() {
		// if it's already sequencing, there's nothing to do
		if (this.timer != null)
			return;
		// if the user has suspended sequencing, do nothing 
		if (this.userSuspended == true)
			return;

		this.nextInSequence();
		this.timer = window.setInterval(this.nextInSequence.bind(this), this.sequenceTime);
	}
		
	// cycle through the <sections>
	nextInSequence() {
		this.currentPanelIndex++;
		
		// when we've reached the end of the sequence, pause for the designated hold time
		if (this.currentPanelIndex >= this.panels.length) {
			this.suspendSequence();
			this.currentPanelIndex = -1;
			window.setTimeout(this.beginSequenceNow.bind(this), this.holdTime);
		}
		
		// normal sequencing
		else {
			var animate = true;
			this.showPanel(this.panels[this.currentPanelIndex], this.buttons[this.currentPanelIndex], animate);
		}
	}
	
	suspendSequence() {
		// if it's not currently sequencing, there's nothing to do
		if (this.timer == null)
			return;
		
		window.clearInterval(this.timer);
		this.timer = null;
	}

	//-------------------------------------------------------------------------
	// helper methods
	//-------------------------------------------------------------------------

	//> variableName is something declared in CSS which has a value in seconds (s) or milliseconds (ms)
	//< a time in milliseconds
	getCSSTimeVariable(variableName) {
		var cssStyles = getComputedStyle(this);
		var sequenceTime = cssStyles.getPropertyValue(variableName);
		if (sequenceTime == undefined)
			return 0;
		
		var milliseconds;
		if (sequenceTime.indexOf('ms') != -1)
			milliseconds = parseInt(sequenceTime.substr(0, sequenceTime.indexOf('ms')));
		else if (sequenceTime.indexOf('s') != -1)
			milliseconds = parseInt(sequenceTime.substr(0, sequenceTime.indexOf('s'))) * 1000;
		else
			milliseconds = parseInt(sequenceTime) * 1000;
		
		return milliseconds
	}
}

window.customElements.define(Static.componentName, RwtStoryboard);
