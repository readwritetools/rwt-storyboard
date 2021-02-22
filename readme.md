












<figure>
	<img src='/img/components/storyboard/storyboard-1500x750.jpg' width='100%' />
	<figcaption></figcaption>
</figure>

##### Premium DOM Component

# Storyboard

## Multi-panel story with cool effects


<address>
<img src='/img/48x48/rwtools.png' /> by <a href='https://readwritetools.com' title='Read Write Tools'>Read Write Tools</a> <time datetime=2020-09-09>Sep 9, 2020</time></address>



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

### Installation

#### Prerequisites

The <span>rwt-storyboard</span> DOM component works in any browser
that supports modern W3C standards. Templates are written using <span>BLUE
</span><span>PHRASE</span> notation, which can be compiled into HTML using the free <a href='https://hub.readwritetools.com/desktop/rwview.blue'>Read Write View</a>
desktop app. It has no other prerequisites. Distribution and installation are
done with either NPM or via Github.

#### Download


<details>
	<summary>Download using NPM</summary>
	<p><b>OPTION 1:</b> Familiar with Node.js and the <code>package.json</code> file?<br />Great. Install the component with this command:</p>
	<pre lang=bash>
npm install rwt-storyboard<br />	</pre>
	<p><b>OPTION 2:</b> No prior experience using NPM?<br />Just follow these general steps:</p>
	<ul>
		<li>Install <a href='https://nodejs.org'>Node.js/NPM</a> on your development computer.</li>
		<li>Create a <code>package.json</code> file in the root of your web project using the command:</li>
		<pre lang=bash>
npm init<br />		</pre>
		<li>Download and install the DOM component using the command:</li>
		<pre lang=bash>
npm install rwt-storyboard<br />		</pre>
	</ul>
	<p style='font-size:0.9em'>Important note: This DOM component uses Node.js and NPM and <code>package.json</code> as a convenient <i>distribution and installation</i> mechanism. The DOM component itself does not need them.</p>
</details>


<details>
	<summary>Download using Github</summary>
	<p>If you prefer using Github directly, simply follow these steps:</p>
	<ul>
		<li>Create a <code>node_modules</code> directory in the root of your web project.</li>
		<li>Clone the <span class=product>rwt-storyboard</span> DOM component into it using the command:</li>
		<pre lang=bash>
git clone https://github.com/readwritetools/rwt-storyboard.git<br />		</pre>
	</ul>
</details>

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
	<tr><td><img src='/img/48x48/read-write-hub.png' alt='DOM components logo' width=48 /></td>	<td>Documentation</td> 		<td><a href='https://hub.readwritetools.com/components/storyboard.blue'>READ WRITE HUB</a></td></tr>
	<tr><td><img src='/img/48x48/git.png' alt='git logo' width=48 /></td>	<td>Source code</td> 			<td><a href='https://github.com/readwritetools/rwt-storyboard'>github</a></td></tr>
	<tr><td><img src='/img/48x48/dom-components.png' alt='DOM components logo' width=48 /></td>	<td>Component catalog</td> 	<td><a href='https://domcomponents.com/components/storyboard.blue'>DOM COMPONENTS</a></td></tr>
	<tr><td><img src='/img/48x48/npm.png' alt='npm logo' width=48 /></td>	<td>Package installation</td> <td><a href='https://www.npmjs.com/package/rwt-storyboard'>npm</a></td></tr>
	<tr><td><img src='/img/48x48/read-write-stack.png' alt='Read Write Stack logo' width=48 /></td>	<td>Publication venue</td>	<td><a href='https://readwritestack.com/components/storyboard.blue'>READ WRITE STACK</a></td></tr>
</table>

### License

The <span>rwt-storyboard</span> DOM component is not freeware. After
evaluating it and before using it in a public-facing website, eBook, mobile app,
or desktop application, you must obtain a license from <a href='https://readwritetools.com/licensing.blue'>Read Write Tools</a>
.

<img src='/img/blue-seal-premium-software.png' width=80 align=right />

<details>
	<summary>Storyboard Software License Agreement</summary>
	<ol>
		<li>This Software License Agreement ("Agreement") is a legal contract between you and Read Write Tools ("RWT"). The "Materials" subject to this Agreement include the "Storyboard" software and associated documentation.</li>
		<li>By using these Materials, you agree to abide by the terms and conditions of this Agreement.</li>
		<li>The Materials are protected by United States copyright law, and international treaties on intellectual property rights. The Materials are licensed, not sold to you, and can only be used in accordance with the terms of this Agreement. RWT is and remains the owner of all titles, rights and interests in the Materials, and RWT reserves all rights not specifically granted under this Agreement.</li>
		<li>Subject to the terms of this Agreement, RWT hereby grants to you a limited, non-exclusive license to use the Materials subject to the following conditions:</li>
		<ul>
			<li>You may not distribute, publish, sub-license, sell, rent, or lease the Materials.</li>
			<li>You may not decompile or reverse engineer any source code included in the software.</li>
			<li>You may not modify or extend any source code included in the software.</li>
			<li>Your license to use the software is limited to the purpose for which it was originally intended, and does not include permission to extract, link to, or use parts on a separate basis.</li>
		</ul>
		<li>Each paid license allows use of the Materials under one "Fair Use Setting". Separate usage requires the purchase of a separate license. Fair Use Settings include, but are not limited to: eBooks, mobile apps, desktop applications and websites. The determination of a Fair Use Setting is made at the sole discretion of RWT. For example, and not by way of limitation, a Fair Use Setting may be one of these:</li>
		<ul>
			<li>An eBook published under a single title and author.</li>
			<li>A mobile app for distribution under a single app name.</li>
			<li>A desktop application published under a single application name.</li>
			<li>A website published under a single domain name. For this purpose, and by way of example, the domain names "alpha.example.com" and "beta.example.com" are considered to be separate websites.</li>
			<li>A load-balanced collection of web servers, used to provide access to a single website under a single domain name.</li>
		</ul>
		<li>THE MATERIALS ARE PROVIDED BY READ WRITE TOOLS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL READ WRITE TOOLS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.</li>
		<li>This license is effective for a one year period from the date of purchase or until terminated by you or Read Write Tools. Continued use, publication, or distribution of the Materials after the one year period, under any of this Agreement's Fair Use Settings, is subject to the renewal of this license.</li>
		<li>Products or services that you sell to third parties, during the valid license period of this Agreement and in compliance with the Fair Use Settings provision, may continue to be used by third parties after the effective period of your license.</li>
		<li>If you decide not to renew this license, you must remove the software from any eBook, mobile app, desktop application, web page or other product or service where it is being used.</li>
		<li>Without prejudice to any other rights, RWT may terminate your right to use the Materials if you fail to comply with the terms of this Agreement. In such event, you shall uninstall and delete all copies of the Materials.</li>
		<li>This Agreement is governed by and interpreted in accordance with the laws of the State of California. If for any reason a court of competent jurisdiction finds any provision of the Agreement to be unenforceable, that provision will be enforced to the maximum extent possible to effectuate the intent of the parties and the remainder of the Agreement shall continue in full force and effect.</li>
	</ol>
</details>

#### Activation

To activate your license, copy the `rwt-registration-keys.js` file to the *root
directory of your website*, providing the `customer-number` and `access-key` sent to
your email address, and replacing `example.com` with your website's hostname.
Follow this example:

<pre>
export default [{
    "product-key": "rwt-storyboard",
    "registration": "example.com",
    "customer-number": "CN-xxx-yyyyy",
    "access-key": "AK-xxx-yyyyy"
}]
</pre>

