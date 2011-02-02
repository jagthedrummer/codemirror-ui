/**
 * @author jgreen
 */

var cursor = null;

 function setupFindReplace(){
 	document.getElementById('closeButton').onclick = closeWindow;
	document.getElementById('findButton').onclick = find;
	document.getElementById('replaceButton').onclick = replace;
	document.getElementById('replaceFindButton').onclick = replaceFind;
 }

 function closeWindow(){
 	codeMirrorUI.searchWindow = null;
 	window.close();
 }
 
 function find(){
 	var findString = document.getElementById('find').value;
	if(findString == null || findString == ''){
		alert('You must enter something to search for.');
		return;		
	}
	cursor = codeMirrorUI.mirror.getSearchCursor(findString, true);
	cursor.findNext();
	cursor.select();
 }
 
 function replace(){
 	codeMirrorUI.replaceSelection(document.getElementById('replace').value);
 	setTimeout(window.focus,100);
	//alert('replaced!');
 }

 function replaceFind(){
 	replace();
	find();
 }
