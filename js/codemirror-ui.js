/* Demonstration of embedding CodeMirror in a bigger application. The
 * interface defined here is a mess of prompts and confirms, and
 * should probably not be used in a real project.
 */
//var CodeMirrorUI = Class.create();

function CodeMirrorUI(place, options, mirrorOptions){
	this.initialize(place, options, mirrorOptions);
}


CodeMirrorUI.prototype = {

    initialize: function(textarea, options, mirrorOptions){
		var defaultOptions = {
			searchMode : 'popup', // other options are 'inline' and 'dialog'.  The 'dialog' option needs work.
			path : 'js',
			buttons : ['search', 'undo', 'redo','jump','reindentSelection','reindent']
		}
		this.textarea = textarea
        this.options = options;
		this.setDefaults(this.options,defaultOptions);
        //We need to keep a handle on the undo and redo buttons
        //since they will be frequently updated based on the state
        //of the mirror.historySize() object.
        this.undoButtons = [];
        this.redoButtons = [];
        
        this.buttonDefs = {
            'search': ["Search/Replace", "find_replace_popup", this.options.path + "../images/silk/find.png",this.find_replace_popup],
			'searchClose': ["Close", "find_replace_popup_close", this.options.path + "../images/silk/cancel.png",this.find_replace_popup_close],
			'searchDialog': ["Search/Replace", "find_replace_window", this.options.path + "../images/silk/find.png",this.find_replace_window],
            'undo': ["Undo", "undo", this.options.path + "../images/silk/arrow_undo.png",this.undo],
            'redo': ["Redo", "redo", this.options.path + "../images/silk/arrow_redo.png",this.redo],
			'jump': ["Jump to line #","jump",this.options.path + "../images/silk/page_go.png",this.jump],
			'reindentSelection': ["Reformat selection","reindentSelect",this.options.path + "../images/silk/text_indent.png",this.reindentSelection],
			'reindent': ["Reformat whole document","reindent",this.options.path + "../images/silk/page_refresh.png",this.reindent]
        };
        
        
		
		//place = CodeMirror.replace(place)
        
		this.home = document.createElement("div");
        this.textarea.parentNode.insertBefore(this.home,this.textarea);
		/*if (place.appendChild) 
            place.appendChild(this.home);
        else 
            place(this.home);
            */
        this.self = this;
		
		
		
		this.initButtons();
		this.initWordWrapControl();
		
		if (this.options.searchMode == 'inline') {
			this.initFindControl();
		}else if (this.options.searchMode == 'popup') {
			this.initPopupFindControl();
		}
		
		mirrorOptions['onChange'] = this.editorChanged.bind(this);
    	this.mirror = CodeMirror.fromTextArea(this.textarea, mirrorOptions);
		//now trigger the undo/redo buttons 
		this.addButtonsClass(this.undoButtons, 'inactive');
		this.addButtonsClass(this.redoButtons, 'inactive');
    },
	
	setDefaults : function(object, defaults) {
    	for (var option in defaults) {
      		if (!object.hasOwnProperty(option))
        		object[option] = defaults[option];
    		}
  	},
	
	toTextArea : function(){
		this.home.parentNode.removeChild(this.home);
		this.mirror.toTextArea();
	},
	
	initButtons : function(){
		this.buttonFrame = document.createElement("div");
		this.buttonFrame.className = "codemirror-ui-clearfix codemirror-ui-button-frame";
		this.home.appendChild(this.buttonFrame);
		for (var i = 0; i < this.options.buttons.length; i++) {
	        var buttonId = this.options.buttons[i];
	        var buttonDef = this.buttonDefs[buttonId];
	        this.addButton(buttonDef[0], buttonDef[1], buttonDef[2], buttonDef[3],this.buttonFrame);
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
	/*
    makeButton : function(name, action){
        var button = document.createElement("input");
        button.type = "button";
        button.value = name;
        this.home.appendChild(button);
        button.onclick = function(){
            self[action].call(self);
        };
    },
	*/
	
	createFindBar : function(){
		var findBar = document.createElement("div");
		findBar.className = "codemirror-ui-find-bar";
		
		this.findString = document.createElement("input");
		this.findString.type = "text";
		this.findString.size = 8;
		
		this.findButton = document.createElement("input");
		this.findButton.type = "button";
		this.findButton.value = "Find";
		this.findButton.onclick = this.find.bind(this);
		
		
		var regLabel = document.createElement("label");
		this.regex = document.createElement("input");
		this.regex.type = "checkbox"
		this.regex.className = "codemirror-ui-checkbox"
		regLabel.appendChild(this.regex);
		regLabel.appendChild(document.createTextNode("RegEx"));
		
		
		this.replaceString = document.createElement("input");
		this.replaceString.type = "text";
		this.replaceString.size = 8;
		
		this.replaceButton = document.createElement("input");
		this.replaceButton.type = "button";
		this.replaceButton.value = "Replace";
		this.replaceButton.onclick = this.replace.bind(this);
		
		var replaceAllLabel = document.createElement("label");
		this.replaceAll = document.createElement("input");
		this.replaceAll.type = "checkbox"
		this.replaceAll.className = "codemirror-ui-checkbox"
		replaceAllLabel.appendChild(this.replaceAll);
		replaceAllLabel.appendChild(document.createTextNode("All"));
		
		findBar.appendChild(this.findString);
		findBar.appendChild(this.findButton);
		findBar.appendChild(regLabel);
		
		
		findBar.appendChild(this.replaceString);
		findBar.appendChild(this.replaceButton);
		findBar.appendChild(replaceAllLabel);
		return findBar;
	},
	
	initPopupFindControl : function(){
		var findBar = this.createFindBar();
		
		this.popupFindWrap = document.createElement("div");
		this.popupFindWrap.className = "codemirror-ui-popup-find-wrap";
		
		this.popupFindWrap.appendChild(findBar);
		
		var buttonDef = this.buttonDefs['searchClose'];
	    this.addButton(buttonDef[0], buttonDef[1], buttonDef[2], buttonDef[3],this.popupFindWrap);
		
		
		this.buttonFrame.appendChild(this.popupFindWrap);
		
		
	},
	
	initFindControl : function(){
		var findBar = this.createFindBar();
		this.buttonFrame.appendChild(findBar);
	},
	
	
	find : function(){
		var findString = this.findString.value;
		if (findString == null || findString == '') {
	        alert('You must enter something to search for.');
	        return;
	    }
		if(this.regex.checked){
			findString = new RegExp(findString);
		}
		this.cursor = this.mirror.getSearchCursor(findString, true);
    	var found = this.cursor.findNext();
		if(found){
			this.cursor.select();
		}else{
			if(confirm("No more matches.  Should we start from the top?")){
				this.cursor = this.mirror.getSearchCursor(findString, false);
    			found = this.cursor.findNext();
				if(found){
					this.cursor.select();
				}else{
					alert("No matches found.");
				}
			}
		}
	},
	
	replace : function(){
		if(this.replaceAll.checked){
			var cursor = this.mirror.getSearchCursor(this.findString.value, false);
		    while (cursor.findNext())
		      cursor.replace(this.replaceString.value);
		}else{
			this.cursor.replace(this.replaceString.value);
			this.find();
		}
	},
	
	initWordWrapControl : function(){
		var wrapDiv = document.createElement("div");
		wrapDiv.className = "codemirror-ui-wrap"
		
		var label = document.createElement("label");
		
		this.wordWrap = document.createElement("input");
		this.wordWrap.type = "checkbox"
		this.wordWrap.checked = true;
		label.appendChild(this.wordWrap);
		label.appendChild(document.createTextNode("Word Wrap"));
		this.wordWrap.onchange = this.toggleWordWrap.bind(this);
		wrapDiv.appendChild(label);
		this.buttonFrame.appendChild(wrapDiv);
	},
	
	
	
	toggleWordWrap : function(){
		if(this.wordWrap.checked){
			this.mirror.setTextWrapping("nowrap");
		}else{
			this.mirror.setTextWrapping("");
		}
	},
	
	
	addButton : function(name, action, image,func,frame){
        var button = document.createElement("a");
        button.href = "#";
        button.className = "codemirror-ui-button " + action;
        button.title = name;
		button.func = func.bind(this);
        button.onclick = function(event){
			//alert(event.target);
            event.target.func();
			return false;
			//this.self[action].call(this);
        	//eval("this."+action)();
		}.bind(this,func);
        var img = document.createElement("img");
        img.src = image;
        img.border = 0;
		img.func = func.bind(this);
        button.appendChild(img);
        frame.appendChild(button);
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
	
	find_replace_popup : function(){
		//alert('Hello!');
		this.popupFindWrap.className = "codemirror-ui-popup-find-wrap active";
	},
	
	find_replace_popup_close : function(){
		//alert('Hello!');
		this.popupFindWrap.className = "codemirror-ui-popup-find-wrap";
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
