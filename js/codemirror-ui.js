/* Demonstration of embedding CodeMirror in a bigger application. The
 * interface defined here is a mess of prompts and confirms, and
 * should probably not be used in a real project.
 */
//var CodeMirrorUI = Class.create();

function CodeMirrorUI(place, options, mirrorOptions){
	this.initialize(place, options, mirrorOptions);
}

function CodeMirrorUIOld(place, options, mirrorOptions){

    
    
    
    
    
    
    
    
}

CodeMirrorUI.prototype = {

    initialize: function(place, options, mirrorOptions){
        this.options = options;
        //We need to keep a handle on the undo and redo buttons
        //since they will be frequently updated based on the state
        //of the mirror.historySize() object.
        this.undoButtons = [];
        this.redoButtons = [];
        
        this.buttonDefs = {
            'search': ["Search/Replace", "find_replace_window", "images/silk/find.png",this.find_replace_window],
            'undo': ["Undo", "undo", "images/silk/arrow_undo.png",this.undo],
            'redo': ["Redo", "redo", "images/silk/arrow_redo.png",this.redo],
			'jump': ["Jump to line #","jump","images/silk/page_go.png",this.jump],
			'reindentSelection': ["Reformat selection","reindentSelect","images/silk/text_indent.png",this.reindentSelection],
			'reindent': ["Reformat whole document","reindent","images/silk/page_refresh.png",this.reindent]
        };
        this.buttons = ['search', 'undo', 'redo','jump','reindentSelection','reindent'];
        
        this.home = document.createElement("div");
        if (place.appendChild) 
            place.appendChild(this.home);
        else 
            place(this.home);
        this.self = this;
		
		this.initButtons();
		
		mirrorOptions['onChange'] = this.editorChanged.bind(this);
    	this.mirror = new CodeMirror(this.home, mirrorOptions);
		//now trigger the undo/redo buttons 
		this.addButtonsClass(this.undoButtons, 'inactive');
		this.addButtonsClass(this.redoButtons, 'inactive');
    },
	
	initButtons : function(){
		for (var i = 0; i < this.buttons.length; i++) {
	        var buttonId = this.buttons[i];
	        var buttonDef = this.buttonDefs[buttonId];
	        this.addButton(buttonDef[0], buttonDef[1], buttonDef[2], buttonDef[3]);
	    }
	    
	    
	    //this.makeButton("Search", "search");
	    //this.makeButton("Replace", "replace");
	    //this.makeButton("Current line", "line");
	    //this.makeButton("Jump to line", "jump");
	    //this.makeButton("Insert constructor", "macro");
	    //this.makeButton("Indent all", "reindent");
	},
    
	/*
	 * This is left over from the MirrorFrame demo.
	 * Get rid of it quick.
	 */
    makeButton : function(name, action){
        var button = document.createElement("input");
        button.type = "button";
        button.value = name;
        this.home.appendChild(button);
        button.onclick = function(){
            self[action].call(self);
        };
    },
	
	
	addButton : function(name, action, image,func){
        var button = document.createElement("a");
        button.href = "#";
        button.className = "codemirror-ui-button " + action;
        button.title = name;
		button.func = func.bind(this);
        button.onclick = function(event){
			//alert(event.target);
            event.target.func();
			//this.self[action].call(this);
        	//eval("this."+action)();
		}.bind(this,func);
        var img = document.createElement("img");
        img.src = image;
        img.border = 0;
		img.func = func.bind(this);
        button.appendChild(img);
        this.home.appendChild(button);
        if(action == 'undo'){ this.undoButtons.push(button) }
        if(action == 'redo'){ this.redoButtons.push(button) }
    },
	
	classNameRegex : function(className){
		var regex = new RegExp("(.*) *"+className+" *(.*)");
		return regex;
	},
	
    addButtonsClass: function(buttons, className){
    	
		for(var b = 0; b<buttons.length; b++){
			button = buttons[b];
			if( !button.className.match(this.classNameRegex(className)) ){
				button.className += " " + className;
			}
		}
		
    },
	
	removeButtonsClass: function(buttons, className){
    	for(var b = 0; b<buttons.length; b++){
			button = buttons[b];
			//console.log("testing " + button.className + " for " + className);
			var m = button.className.match(this.classNameRegex(className))
			if( m ){
				button.className = m[1] + " " + m[2];
			}
		}
    },
    
    editorChanged: function(){
        var his = this.mirror.historySize();
        if (his['undo'] > 0) {
            this.removeButtonsClass(this.undoButtons, 'inactive');
        }
        else {
            this.addButtonsClass(this.undoButtons, 'inactive');
        }
        if (his['redo'] > 0) {
            this.removeButtonsClass(this.redoButtons, 'inactive');
        }
        else {
            this.addButtonsClass(this.redoButtons, 'inactive');
        }
        //alert("undo size = " + his['undo'] + " and redo size = " + his['redo']);
    },
    
    undo: function(){
        this.mirror.undo();
    },
    
    redo: function(){
        this.mirror.redo();
    },
    
    replaceSelection: function(newVal){
        this.mirror.replaceSelection(newVal);
        this.searchWindow.focus();
    },
    
    raise_search_window: function(){
        //alert('raising window!');
        this.searchWindow.focus();
    },
    
    
    find_replace_window: function(){
        if (this.searchWindow == null) {
            this.searchWindow = window.open(this.options.path + "find_replace.html", "mywindow", "scrollbars=1,width=400,height=350,modal=yes");
            this.searchWindow.codeMirrorUI = this;
        }
        this.searchWindow.focus();
    },
    
	/*
    find_replace: function(){
        this.find_replace = document.createElement("div");
        this.find_replace.className = "codemirror-search-replace";
        this.find_replace.innerHTML = "Just a test!";
        this.home.appendChild(this.find_replace);
    },
    
    search: function(){
        var text = prompt("Enter search term:", "");
        if (!text) 
            return;
        
        var first = true;
        do {
            var cursor = this.mirror.getSearchCursor(text, first);
            first = false;
            while (cursor.findNext()) {
                cursor.select();
                if (!confirm("Search again?")) 
                    return;
            }
        }
        while (confirm("End of document reached. Start over?"));
    },
    
    replace: function(){
        // This is a replace-all, but it is possible to implement a
        // prompting replace.
        var from = prompt("Enter search string:", ""), to;
        if (from) 
            to = prompt("What should it be replaced with?", "");
        if (to == null) 
            return;
        
        var cursor = this.mirror.getSearchCursor(from, false);
        while (cursor.findNext()) 
            cursor.replace(to);
    },
    */
    jump: function(){
        var line = prompt("Jump to line:", "");
        if (line && !isNaN(Number(line))) 
            this.mirror.jumpToLine(Number(line));
    },
    
	/*
    line: function(){
        alert("The cursor is currently at line " + this.mirror.currentLine());
        this.mirror.focus();
    },
    
    macro: function(){
        var name = prompt("Name your constructor:", "");
        if (name) 
            this.mirror.replaceSelection("function " + name + "() {\n  \n}\n\n" + name + ".prototype = {\n  \n};\n");
    },
    */
    reindent: function(){
        this.mirror.reindent();
    },
	
	reindentSelection: function(){
        this.mirror.reindentSelection();
    }
};


/*
 * This makes coding callbacks much more sane
 */
Function.prototype.bind = function(scope){
    var _function = this;
    
    return function(){
        return _function.apply(scope, arguments);
    }
}
