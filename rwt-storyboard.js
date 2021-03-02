/* Copyright (c) 2021 Read Write Tools. Legal use subject to the Storyboard DOM Component Software License Agreement. */
const Static = {
    componentName: 'rwt-storyboard',
    elementInstance: 1,
    htmlURL: '/node_modules/rwt-storyboard/rwt-storyboard.html',
    cssURL: '/node_modules/rwt-storyboard/rwt-storyboard.css',
    htmlText: null,
    cssText: null
};

Object.seal(Static);

export default class RwtStoryboard extends HTMLElement {
    constructor() {
        super(), this.instance = Static.elementInstance++, this.isComponentLoaded = !1, 
        this.frame = null, this.controller = null, this.panels = new Array, this.buttons = new Array, 
        this.previousPanel = null, this.currentPanel = null, this.currentPanelIndex = -1, 
        this.timer = null, this.honorInitialDelay = !0, this.userSuspended = !1, this.initialDelay = 0, 
        this.sequenceTime = 0, this.holdTime = 0, this.threshold = .95, this.intersectionObserver = null, 
        Object.seal(this);
    }
    async connectedCallback() {
        if (this.isConnected) try {
            var e = await this.getHtmlFragment(), t = await this.getCssStyleElement(), n = await this.fetchPanels();
            if (null != n) e.getElementById('frame').appendChild(n);
            this.attachShadow({
                mode: 'open'
            }), this.shadowRoot.appendChild(e), this.shadowRoot.appendChild(t), this.identifyChildren(), 
            this.createControllerButtons(), this.readTimingVariables(), this.registerEventListeners(), 
            this.registerIntersectionObserver(), this.showFirstPanel(), this.sendComponentLoaded(), 
            this.validate();
        } catch (e) {
            console.log(e.message);
        }
    }
    getHtmlFragment() {
        return new Promise((async (e, t) => {
            var n = `${Static.componentName}-html-template-ready`;
            if (document.addEventListener(n, (() => {
                var t = document.createElement('template');
                t.innerHTML = Static.htmlText, e(t.content);
            })), 1 == this.instance) {
                var s = await fetch(Static.htmlURL, {
                    cache: 'no-cache',
                    referrerPolicy: 'no-referrer'
                });
                if (200 != s.status && 304 != s.status) return void t(new Error(`Request for ${Static.htmlURL} returned with ${s.status}`));
                Static.htmlText = await s.text(), document.dispatchEvent(new Event(n));
            } else null != Static.htmlText && document.dispatchEvent(new Event(n));
        }));
    }
    getCssStyleElement() {
        return new Promise((async (e, t) => {
            var n = `${Static.componentName}-css-text-ready`;
            if (document.addEventListener(n, (() => {
                var t = document.createElement('style');
                t.innerHTML = Static.cssText, e(t);
            })), 1 == this.instance) {
                var s = await fetch(Static.cssURL, {
                    cache: 'no-cache',
                    referrerPolicy: 'no-referrer'
                });
                if (200 != s.status && 304 != s.status) return void t(new Error(`Request for ${Static.cssURL} returned with ${s.status}`));
                Static.cssText = await s.text(), document.dispatchEvent(new Event(n));
            } else null != Static.cssText && document.dispatchEvent(new Event(n));
        }));
    }
    async fetchPanels() {
        if (0 == this.hasAttribute('sourceref')) return null;
        var e = this.getAttribute('sourceref'), t = await fetch(e, {
            cache: 'no-cache',
            referrerPolicy: 'no-referrer'
        });
        if (200 != t.status && 304 != t.status) return null;
        var n = await t.text(), s = document.createElement('template');
        return s.innerHTML = n, s.content;
    }
    identifyChildren() {
        this.frame = this.shadowRoot.getElementById('frame'), this.controller = this.shadowRoot.getElementById('controller');
        var e = this.shadowRoot.querySelectorAll('section');
        for (let t of e) this.panels.push(t);
    }
    createControllerButtons() {
        for (let n = 0; n < this.panels.length; n++) {
            var e = this.panels[n], t = document.createElement('button');
            t.innerText = '●', t.setAttribute('type', 'button'), t.storyboardPanel = e, t.panelIndex = n, 
            this.controller.appendChild(t), this.buttons.push(t);
        }
    }
    readTimingVariables() {
        this.initialDelay = this.getCSSTimeVariable('--initial-delay'), this.sequenceTime = this.getCSSTimeVariable('--sequence-time'), 
        this.holdTime = this.getCSSTimeVariable('--hold-time'), this.threshold = this.getCSSFloatVariable('--threshold');
    }
    registerEventListeners() {
        this.frame.addEventListener('click', this.onClickFrame.bind(this));
        var e = this.shadowRoot.querySelectorAll('#controller button');
        for (let t of e) t.addEventListener('click', this.onClickButton.bind(this));
        document.addEventListener('collapse-popup', this.onCollapsePopup.bind(this));
    }
    registerIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((e => {
            1 == e[0].isIntersecting ? this.startSequence() : this.suspendSequence();
        }), {
            threshold: this.threshold
        }), this.intersectionObserver.observe(this.frame);
    }
    sendComponentLoaded() {
        this.isComponentLoaded = !0, this.dispatchEvent(new Event('component-loaded', {
            bubbles: !0
        }));
    }
    waitOnLoading() {
        return new Promise((e => {
            1 == this.isComponentLoaded ? e() : this.addEventListener('component-loaded', e);
        }));
    }
    onClickFrame(e) {
        null != this.timer ? (this.userSuspended = !0, this.suspendSequence()) : 1 == this.honorInitialDelay || (this.userSuspended = !1, 
        this.startSequence()), e.stopPropagation();
    }
    onClickButton(e) {
        this.userSuspended = !0, this.suspendSequence();
        var t = e.target;
        this.showPanel(t.storyboardPanel, t, !1), this.currentPanelIndex = t.panelIndex, 
        e.stopPropagation();
    }
    onCollapsePopup(e) {
        this.suspendSequence();
    }
    showFirstPanel() {
        if (0 != this.panels.length) {
            this.showPanel(this.panels[0], this.buttons[0], !1), this.currentPanelIndex = 0;
        }
    }
    showPanel(e, t, n) {
        if (e != this.currentPanel) {
            this.previousPanel = this.currentPanel, this.currentPanel = e;
            for (let e of this.panels) if (e == this.previousPanel) if (1 == n) {
                var s = e.getAttribute('data-prev');
                e.className = `${s} show`;
            } else e.className = 'hide'; else if (e == this.currentPanel) if (1 == n) {
                s = e.getAttribute('data-next');
                e.className = `${s} show`;
            } else e.className = 'show'; else e.className = 'hide';
            for (let e of this.buttons) e.className = e == t ? 'current-panel' : '';
        }
    }
    startSequence() {
        1 == this.honorInitialDelay ? (this.honorInitialDelay = !1, window.setTimeout(this.beginSequenceNow.bind(this), this.initialDelay)) : this.beginSequenceNow();
    }
    beginSequenceNow() {
        null == this.timer && 1 != this.userSuspended && (this.nextInSequence(), this.timer = window.setInterval(this.nextInSequence.bind(this), this.sequenceTime));
    }
    nextInSequence() {
        if (this.currentPanelIndex++, this.currentPanelIndex >= this.panels.length) this.suspendSequence(), 
        this.currentPanelIndex = -1, window.setTimeout(this.beginSequenceNow.bind(this), this.holdTime); else {
            this.showPanel(this.panels[this.currentPanelIndex], this.buttons[this.currentPanelIndex], !0);
        }
    }
    suspendSequence() {
        null != this.timer && (window.clearInterval(this.timer), this.timer = null);
    }
    getCSSTimeVariable(e) {
        var t = getComputedStyle(this).getPropertyValue(e);
        return null == t ? 0 : -1 != t.indexOf('ms') ? parseInt(t.substr(0, t.indexOf('ms'))) : -1 != t.indexOf('s') ? 1e3 * parseInt(t.substr(0, t.indexOf('s'))) : 1e3 * parseInt(t);
    }
    getCSSFloatVariable(e) {
        var t = getComputedStyle(this).getPropertyValue(e), n = parseFloat(t);
        return Number.isNaN(n) && (n = .95), n < 0 && (n = 0), n > .99 && (n = .99), n;
    }
    async validate() {
        if (1 == this.instance) {
            var e = (i = window.location.hostname).split('.'), t = 25;
            if (e.length >= 2) {
                var n = e[e.length - 2].charAt(0);
                (n < 'a' || n > 'z') && (n = 'q'), t = n.charCodeAt(n) - 97, t = Math.max(t, 0), 
                t = Math.min(t, 25);
            }
            var s = new Date;
            s.setUTCMonth(0, 1), (Math.floor((Date.now() - s) / 864e5) + 1) % 26 == t && window.setTimeout(this.authenticate.bind(this), 5e3);
            var i = window.location.hostname, r = `Unregistered ${Static.componentName} component.`;
            try {
                var a = (await import('../../rwt-registration-keys.js')).default;
                for (let e = 0; e < a.length; e++) {
                    var o = a[e];
                    if (o.hasOwnProperty('product-key') && o['product-key'] == Static.componentName) return void (i != o.registration && console.warn(`${r} See https://readwritetools.com/licensing.blue to learn more.`));
                }
                console.warn(`${r} rwt-registration-key.js file missing "product-key": "${Static.componentName}"`);
            } catch (e) {
                console.warn(`${r} rwt-registration-key.js missing from website's root directory.`);
            }
        }
    }
    async authenticate() {
        var e = encodeURIComponent(window.location.hostname), t = encodeURIComponent(window.location.href), n = encodeURIComponent(Registration.registration), s = encodeURIComponent(Registration['customer-number']), i = encodeURIComponent(Registration['access-key']), r = {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-cache',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: `product-name=${Static.componentName}&hostname=${e}&href=${t}&registration=${n}&customer-number=${s}&access-key=${i}`
        };
        try {
            var a = await fetch('https://validation.readwritetools.com/v1/genuine/component', r);
            if (200 == a.status) await a.json();
        } catch (e) {
            console.info(e.message);
        }
    }
}

window.customElements.define(Static.componentName, RwtStoryboard);