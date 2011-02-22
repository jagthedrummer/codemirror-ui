CodeMirror UI
=============

CodeMirrorUI is a simple interface written by Jeremy Green to act as a 
wrapper around the [CodeMirror](href="http://codemirror.net/") text editor widget by Marijn Haverbeke.
CodeMirror is a syntax highlighter and formatter that makes it much easier to edit source code in a browser.
ComeMirrorUI is a wrapper that adds interface functionality for many functions that are already built into CodeMirror itself.
Functionality includes undo, redo, jump to line, reindent selection, and reindent entire document. 
Two options for find/replace are also available.  It is based on the MirrorFrame example that Marijn included with CodeMirror.

Demo
-------------------

[http://www.octolabs.com/javascripts/codemirror-ui/index.html](http://www.octolabs.com/javascripts/codemirror-ui/index.html)


Easily Configurable
--------------------

It's easy to configure an editor with something like this:

		//first set up some variables
		var textarea = document.getElementById('code1');
		var uiOptions = { path : 'js/', quickSearch : false }
		var codeMirrorOptions = {
		    height: "250px",
		    content: textarea.value,
		    parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
		    stylesheet: "lib/CodeMirror-0.93/css/jscolors.css",
		    path: "lib/CodeMirror-0.93/js/",
		    autoMatchParens: true
		}
		
		//then create the editor
		var editor = new CodeMirrorUI(textarea,uiOptions,codeMirrorOptions);	</pre>
			
Installation
--------------------

		<script src="lib/CodeMirror-0.93/js/codemirror.js" type="text/javascript"></script>
		<script src="js/codemirror-ui.js" type="text/javascript"></script>
		<link rel="stylesheet" href="css/codemirror-ui.css" type="text/css" media="screen" />

You'll probably need to adjust the paths to fit your situation.


Please see index.html for examples and many additional details.