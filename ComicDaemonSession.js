var Session = undefined;

function ClearSession(){
    if (localStorage != undefined) {
        localStorage.clear();
    }
}

function LoadSession() {
    // Code for localStorage/sessionStorage.
    
    //alert(typeof(Storage) !== "undefined");
    //alert(localStorage != "undefined");
    //alert(localStorage["Session"]);

    //define empty session object
    Session = {};
    
    if (typeof(Storage) !== "undefined") {
        if (localStorage != undefined && localStorage["Session"] != undefined) {
            var data = localStorage["Session"];
            //alert(data);
            Session = JSON.parse(data);
        }
    }
}
        
function SaveSession() {
    if (typeof(Storage) !== "undefined") {
        if (localStorage != undefined) {
            var data = JSON.stringify(Session);
            //alert(data);
            localStorage.setItem("Session", data);
        }
    }
}

function SessionGetLastVisitTime() {
    var lastVisitTime = undefined;
    
    if (Session != undefined && Session["LastVisitTime"] != undefined) {
        lastVisitTime = Session["LastVisitTime"];
    }
    
    return lastVisitTime;
}

function SessionSetLastVisitTime() {
    Session["LastVisitTime"] = Date.now();
    SaveSession();
}

var SESSION_COMICS = "comics";
var SESSION_COMIC_NUMBER = "comicNumber";
var SESSION_HIDE_TAGS_LIST = "hideTags";
var STAR_TAG = "star";
var DEFAULT_HIDE_LIST = [];

function SessionSetLastComicNumber(comicName, comicNumber) {
    if (Session == undefined) {
        // Programming Error
        alert("SessionSetLastComicNumber Session undefined");
        return;
    }

    if (undefined == Session[SESSION_COMICS]) {
        Session["comics"] = {};
    }
    
    var comics = Session[SESSION_COMICS];
    
    if (undefined == comics[comicName]){
        comics[comicName] = {};
    }
    
    comics[comicName][SESSION_COMIC_NUMBER] = comicNumber;
    SaveSession();
}

function SessionGetLastComicNumber(comicName) {
    if (undefined == Session) {
        // Programming Error
        alert("SessionGetLastComicNumber Session undefined");
        return 0;
    }

    if (undefined == Session[SESSION_COMICS] 
        || undefined == Session[SESSION_COMICS][comicName]
        || undefined == Session[SESSION_COMICS][comicName][SESSION_COMIC_NUMBER]
        ){
        
        return 0;
    }

    return Session[SESSION_COMICS][comicName][SESSION_COMIC_NUMBER];
}


function SessionGetHideTagList() {
    if (undefined == Session) {
        // Programming Error
        alert("SessionGetHideList Session undefined");
        return DEFAULT_HIDE_LIST;
    }

    if (undefined == Session[SESSION_HIDE_TAGS_LIST]) {
        return DEFAULT_HIDE_LIST;
    }
    
    return Session[SESSION_HIDE_TAGS_LIST];
    
}

function SessionSetHideTagList(hideList) {
    if (Session == undefined) {
        // Programming Error
        alert("SessionSetHideList Session undefined");
        return;
    }

    Session[SESSION_HIDE_TAGS_LIST] = hideList;
    SaveSession();
}