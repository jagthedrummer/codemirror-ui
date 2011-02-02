/* Demonstration of embedding CodeMirror in a bigger application. The
 * interface defined here is a mess of prompts and confirms, and
 * should probably not be used in a real project.
 */

function CodeMirrorUI(place,options, mirrorOptions) {
  this.options = options;
  this.home = document.createElement("div");
  if (place.appendChild)
    place.appendChild(this.home);
  else
    place(this.home);

  var self = this;
  function makeButton(name, action) {
    var button = document.createElement("input");
    button.type = "button";
    button.value = name;
    self.home.appendChild(button);
    button.onclick = function(){self[action].call(self);};
  };
  
  
  function addButton(name,action,image){
  	var button = document.createElement("a");
	button.href = "#";
	button.className = "codemirror-ui-button";
	button.title = name;
	button.onclick = function(){self[action].call(self);};
  	var img = document.createElement("img");
	img.src = image;
	img.border = 0;
	button.appendChild(img);
	self.home.appendChild(button);
  };

  

  var buttonDefs = {
  	'search' : ["Search/Replace","find_replace_window","images/silk/find.png"],
	'undo' : ["Undo","undo","images/silk/arrow_undo.png"],
	'redo' : ["Redo","redo","images/silk/arrow_redo.png"]
  };

  var buttons = ['search','undo','redo'];
  
  for(var i=0; i<buttons.length; i++){
  	var buttonId = buttons[i];
	var buttonDef = buttonDefs[buttonId];
	addButton(buttonDef[0],buttonDef[1],buttonDef[2]);
  }
  
  
  makeButton("Search", "search");
  makeButton("Replace", "replace");
  makeButton("Current line", "line");
  makeButton("Jump to line", "jump");
  makeButton("Insert constructor", "macro");
  makeButton("Indent all", "reindent");

  this.mirror = new CodeMirror(this.home, mirrorOptions);
}

CodeMirrorUI.prototype = {
	
	

  undo : function (){
  	this.mirror.undo();
  },
  
  redo : function (){
  	this.mirror.redo();
  },

  replaceSelection : function (newVal){
  	this.mirror.replaceSelection(newVal);
	this.searchWindow.focus();
  },
  
  raise_search_window : function(){
  	//alert('raising window!');
  	this.searchWindow.focus();
  },
  
  
  find_replace_window : function(){
  	if (this.searchWindow == null) {
		this.searchWindow = window.open(this.options.path + "find_replace.html", "mywindow", "scrollbars=1,width=400,height=350,modal=yes");
		this.searchWindow.codeMirrorUI = this;
	}
	this.searchWindow.focus();
  },
	
  find_replace : function(){
  	this.find_replace = document.createElement("div");
	this.find_replace.className = "codemirror-search-replace";
	this.find_replace.innerHTML = "Just a test!";
	this.home.appendChild(this.find_replace);
  },
  	
  search: function() {
    var text = prompt("Enter search term:", "");
    if (!text) return;

    var first = true;
    do {
      var cursor = this.mirror.getSearchCursor(text, first);
      first = false;
      while (cursor.findNext()) {
        cursor.select();
        if (!confirm("Search again?"))
          return;
      }
    } while (confirm("End of document reached. Start over?"));
  },

  replace: function() {
    // This is a replace-all, but it is possible to implement a
    // prompting replace.
    var from = prompt("Enter search string:", ""), to;
    if (from) to = prompt("What should it be replaced with?", "");
    if (to == null) return;

    var cursor = this.mirror.getSearchCursor(from, false);
    while (cursor.findNext())
      cursor.replace(to);
  },

  jump: function() {
    var line = prompt("Jump to line:", "");
    if (line && !isNaN(Number(line)))
      this.mirror.jumpToLine(Number(line));
  },

  line: function() {
    alert("The cursor is currently at line " + this.mirror.currentLine());
    this.mirror.focus();
  },

  macro: function() {
    var name = prompt("Name your constructor:", "");
    if (name)
      this.mirror.replaceSelection("function " + name + "() {\n  \n}\n\n" + name + ".prototype = {\n  \n};\n");
  },

  reindent: function() {
    this.mirror.reindent();
  }
};