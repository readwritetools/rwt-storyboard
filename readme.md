











<figure>
	<img src='/img/components/storyboard/rwt-storyboard.png' width='100%' />
	<figcaption></figcaption>
</figure>

##### Open Source DOM Component

# Storyboard

## Multi-panel story with cool effects


<address>
<img src='/img/rwtools.png' width=80 /> by <a href='https://readwritetools.com' title='Read Write Tools'>Read Write Tools</a> <time datetime=2020-09-09>Sep 9, 2020</time></address>



<table>
	<tr><th>Abstract</th></tr>
	<tr><td>The <span class=product>rwt-storyboard</span> DOM component displays a sequence of panels that tell a story. Transitions from one panel to the next can slide-in or fade-in to dramatic effect. The content of each panel is provided by an HTML template, and the sequencing speed can be controlled by CSS variables.</td></tr>
</table>

### Motivation

The <span>rwt-storyboard</span> DOM component is intended for use on
web pages where the author wants to grab the reader's attention and funnel them
towards a particular action.

The component has these features:

   * Each panel may contain any arbitrary content and styling.
   * Each panel may be transitioned to visibility using it's own effect.
   * The first panel can be shown with an initial delay before the sequencing begins.
   * The last panel can be shown with a final hold time before restarting the full
      sequence.
   * Sequencing occurs only when the component is fully visible within the browser's
      viewport. It is suspended when the component is hidden or only partially
      visible.
   * The user may suspend the auto-sequencing by clicking anywhere within the
      component's frame, and may resume the auto-sequencing by clicking the component
      a second time.
   * Round buttons along the bottom of the storyboard allow the user to override the
      auto-sequencing to display a particular panel.

#### In the wild

To see an example of this component in use, visit the <a href='https://readwritestack.com/'>READ WRITE STACK</a>
website. Each page uses this component to tell a user story about apps, plugins
and DOM components. To understand what's going on under the hood, use the
browser's inspector to view the HTML source code and network activity, and
follow along as you read this documentation.

#### Prerequisites

The <span>rwt-storyboard</span> DOM component works in any browser
that supports modern W3C standards. Templates are written using <span>BLUE
</span><span>PHRASE</span> notation, which can be compiled into HTML using the free <a href='https://hub.readwritetools.com/desktop/rwview.blue'>Read Write View</a>
desktop app. It has no other prerequisites. Distribution and installation are
done with either NPM or via Github.

#### Installation using NPM

If you are familiar with Node.js and the `package.json` file, you'll be
comfortable installing the component just using this command:

```bash
npm install rwt-storyboard
```

If you are a front-end Web developer with no prior experience with NPM, follow
these general steps:

   * Install <a href='https://nodejs.org'>Node.js/NPM</a>
on your development computer.
   * Create a `package.json` file in the root of your web project using the command:
```bash
npm init
```

   * Download and install the DOM component using the command:
```bash
npm install rwt-storyboard
```


Important note: This DOM component uses Node.js and NPM and `package.json` as a
convenient *distribution and installation* mechanism. The DOM component itself
does not need them.

#### Installation using Github

If you are more comfortable using Github for installation, follow these steps:

   * Create a directory `node_modules` in the root of your web project.
   * Clone the <span>rwt-storyboard</span> DOM component into it using the
      command:
```bash
git clone https://github.com/readwritetools/rwt-storyboard.git
```


### Using the DOM component

After installation, you need to add two things to your HTML page to make use of
it.

   * Add a `script` tag to load the component's `rwt-storyboard.js` file:
```html
<script src='/node_modules/rwt-storyboard/rwt-storyboard.js' type=module></script>             
```

   * Add the component tag somewhere on the page with these two attributes:

      * Apply a `sourceref` attribute with a reference to an HTML file containing the
         panels. See details below.
      * Optional. For WAI-ARIA accessibility apply a `role=contentinfo` attribute.

Here's an example:

```html
<rwt-storyboard sourceref='/five-panel-story.html' role=contentinfo></rwt-storyboard>
```

### Panel template

The sourceref file should contain valid HTML consisting of two or more `section` elements.
The contents of each `section` is treated as a panel.

Transition effects are declared by adding the two special attributes `data-next` and
`data-prev` to each `section`. In this example (shown using <span>BLUE</span><span>
PHRASE</span> notation for clarity), each panel will transition to visibility using `fade-in`
and transition to hidden using `fade-out`:

```html
section *data-next='fade-in' *data-prev='fade-out' {
    Ask a leading question
}
section *data-next='fade-in' *data-prev='fade-out' {
    Pose a suggested answer
}
section *data-next='fade-in' *data-prev='fade-out' {
    State the product's feature 
}
section *data-next='fade-in' *data-prev='fade-out' {
    Assert that user needs the product
}
section *data-next='fade-in' *data-prev='fade-out' {
    Give user easy way to get it
}
```

The possible transition values are:

<pre>
fade-in
from-left
from-right
from-top
from-bottom

fade-out
to-left
to-right
to-top
to-bottom
</pre>

### Customization

#### Dimensions

The width and height of the storyboard are set using the CSS variables `--width` and
`--height`.

Adjust the `--font-basis` to shrink or grow the entire storyboard.

```css
rwt-storyboard {
    --font-basis: 1.0;
    --width: calc(10rem * var(--font-basis));
    --height: calc(40rem * var(--font-basis));
}
```

#### Color scheme

The default color palette for the storyboard uses a dark mode theme. You can use
CSS to override the variables' defaults:

```css
rwt-storyboard {
    --color: var(--white);
    --background: var(--black);
    --button-color: var(--pure-white);
}
```

Important: the content of each panel can be customized with any CSS you want,
but that CSS must be included in the sourceref template file together with the
panel's HTML declarations. CSS that is outside the component is firewalled and
will not pierce the document/component barrier.

#### Threshold

Panels will only transition when visible. When the document is scrolled outside
the user's viewport, the transitioning effect is suspended. The component can be
customized to suspend/resume transitions when only a portion of the full
storyboard is visible. The threshold for this is a value between 0.0 and 0.99.

```css
rwt-storyboard {
    --threshold: 0.95;
}
```

#### Timing variables

The sequencing of panel transitions is controlled by CSS variables. Each
variable may specify values in units of seconds (s) or milliseconds (ms).

   * `--duration-in` is the duration for a new panel to become fully visible.
   * `--duration-out` is the duration for the previous panel to become completely
      hidden.
   * `--delay-in` is the amount of time to wait before starting a panel's transition
      from hidden to visible.
   * `--delay-out` is the amount of time to wait before starting a panel's transition
      from visible to hidden.
   * `--initial-delay` is the initial amount of time to show the first panel, before
      beginning the transition to the second panel.
   * `--sequence-time` is the total time from one panel to the next. Normally this
      should be equal to `--duration-in` + `--duration-out` + `--delay-in` + `--delay-out`.
   * `--hold-time` is the final amount of time to show the last panel, before
      restarting the full sequence.

```css
rwt-storyboard {
    --duration-in: 2s;
    --duration-out: 2s;
    --delay-in: 0s;
    --delay-out: 0s;
    --initial-delay: 6s;
    --sequence-time: 4s;
    --hold-time: 6s;
}
```

### Life-cycle events

The component issues life-cycle events.


<dl>
	<dt><code>component-loaded</code></dt>
	<dd>Sent when the component is fully loaded and ready to be used. As a convenience you can use the <code>waitOnLoading()</code> method which returns a promise that resolves when the <code>component-loaded</code> event is received. Call this asynchronously with <code>await</code>.</dd>
	<dt><code>collapse-popup</code></dt>
	<dd>The component listens on DOM <code>document</code> for <code>collapse-popup</code> messages, which are sent when other components are activated. Upon receipt it will suspend sequencing.</dd>
</dl>

---

### Reference


<table>
	<tr><td><img src='/img/read-write-hub.png' alt='DOM components logo' width=40 /></td>	<td>Documentation</td> 		<td><a href='https://hub.readwritetools.com/components/storyboard.blue'>READ WRITE HUB</a></td></tr>
	<tr><td><img src='/img/git.png' alt='git logo' width=40 /></td>	<td>Source code</td> 			<td><a href='https://github.com/readwritetools/rwt-storyboard'>github</a></td></tr>
	<tr><td><img src='/img/dom-components.png' alt='DOM components logo' width=40 /></td>	<td>Component catalog</td> 	<td><a href='https://domcomponents.com/storyboard.blue'>DOM COMPONENTS</a></td></tr>
	<tr><td><img src='/img/npm.png' alt='npm logo' width=40 /></td>	<td>Package installation</td> <td><a href='https://www.npmjs.com/package/rwt-storyboard'>npm</a></td></tr>
	<tr><td><img src='/img/read-write-stack.png' alt='Read Write Stack logo' width=40 /></td>	<td>Publication venue</td>	<td><a href='https://readwritestack.com/components/storyboard.blue'>READ WRITE STACK</a></td></tr>
</table>

### License

The <span>rwt-storyboard</span> DOM component is licensed under the
MIT License.

<img src='/img/blue-seal-mit.png' width=80 align=right />

<details>
	<summary>MIT License</summary>
	<p>Copyright © 2020 Read Write Tools.</p>
	<p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
	<p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
	<p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
</details>

