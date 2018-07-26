// Does list contain any of the elements in the any list?
function ListContainsAny(list, anyList) {
	let i;
	for (let i = 0; i < anyList.length; i++){
		let currentAny = anyList[i];
		if (undefined != list.find(function(element){return element == currentAny;})) {
			return true;
		}
	}
	return false;
}

function ListFindValueIndex(list, value) {
	let index = list.findIndex(function(element){return element == value;});
	
	if (-1 == index) {
		index = undefined;
	}
	
	return index;
}

function ListContainsValue(list, value) {
	return (undefined != ListFindValueIndex(list, value));
}

function ListRemoveValue(list, value) {
	let index = ListFindValueIndex(list, value);
	while (undefined != index) {
		list.splice(index, 1);
		index = ListFindValueIndex(list, value);
	} 
}

// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests

//returns a json object of the files contents from sever
function LoadFileJson(filepath) {
	let xmlhttp = new XMLHttpRequest();
	
	// Need to make this async (set to true and then spin wait...)
	xmlhttp.open("GET", filepath, false);
	xmlhttp.send();
	
	return JSON.parse(xmlhttp.responseText);
}

function CacheFile(filepath) {
	let xmlhttp = new XMLHttpRequest();
	
	// Async Request to Cache.
	xmlhttp.open("GET", filepath, true);
	xmlhttp.send();
}

function Show(id) {
	document.getElementById(id).style.display =  'block';
}

function Hide(id) {
	document.getElementById(id).style.display =  'none';
}