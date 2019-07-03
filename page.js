
// Requires CORS Settings on the Dynamic Data site.
let COMIC_BASE_PATH = "https://dynamicdata.azurewebsites.net/comics/";

function init() {
    Options();
    ShowMainPage();
    LoadSession();
    DisplayWelcome();
    UpdateHideListFromUrl();

    ShowComicList();
    CacheComicData();
}

window.onload = init;

function Options() {
    // TestHooks

    // Casing is Sensitive.
    let sessionOptions = getURLParameter("Session");
    let comicDataLink = getURLParameter("DataLink");
    
    if (null != sessionOptions) {
        sessionOptions = sessionOptions.toLowerCase();
        if ("clear" == sessionOptions) {
            ClearSession();
        }
    }
    
    if (null != comicDataLink) {
        // .\comics\
        COMIC_BASE_PATH = comicDataLink;
    }
    
}

function UpdateHideListFromUrl() {
    let show = getURLParameter("show");
    let hide = getURLParameter("hide");
    
    // TODO: handle + for multiple parameters
    // Should not be a hide tag list but rather a list of hidden comics based on tags.
    /*
        white list of allowed comics hides everythgin else by default.
    
        Following should be supported:
        
        show=ComicA+ComicB+ComicC
            Should only show these comics
        show=all	
            shows all comics, default
        
        hide=completed
        
        exclude invalid tags
    */
    
    let hideTagList = SessionGetHideTagList();

    if (null != show) {
        show = show.toLowerCase();
        if ("all" == show) {
            hideTagList = [];
            
        } else {
            ListRemoveValue(hideTagList, show);
        }	
    }
    
    if (null != hide) {
        hide = hide.toLowerCase();
        if ("all" == hide) {
            let comicListData = GetComicMetadata();
            hideTagList = comicListData["Tags"];
        
        } else {
            hideTagList.push(hide);
        }
    }
    
    SessionSetHideTagList(hideTagList);
}

function DisplayWelcome() {
    Hide('display_comic');
    Show('display_welcome');
    DisplayLastVisitTime();
}

function DisplayComic() {
    Hide('display_welcome');
    Show('display_comic');
}

let ComicListData = undefined;

function GetComicMetadata() {

    if (undefined == ComicListData) {
        let comicListFile = COMIC_BASE_PATH + "Comics.Metadata.json";
    
        ComicListData = LoadFileJson(comicListFile);
    }
    
    return ComicListData;
}

function CacheComicData() {
    // Asynchronously request comic data so it is in the cache.
    
    comicMetadata = GetComicMetadata();
    
    let comics = comicMetadata['Comics'];
    
    let i;
    for (i = 0; i < comics.length; i++) {
        let comic = comics[i];
        let comicFilename = comic['MetadataFileName'];
        
        let comicFile = COMIC_BASE_PATH + comicFilename;
        CacheFile(comicFile);
    }
}

function ShowMainPage() {
    let comicMetadata = GetComicMetadata();

    let lastCrawlTime = comicMetadata['LastCrawlTime'];
    document.getElementById('LastCrawlTime').innerHTML = lastCrawlTime;
}

// Cache ComicList so it does not need to be regenerated.
let LoadedComicList = false;

function ShowComicList() {

    if (!LoadedComicList) {
    
        let comicMetadata = GetComicMetadata();
        
        let comicList = LoadComicList(comicMetadata);
        
        document.getElementById('comic_list').innerHTML = comicList;
        LoadedComicList = true;
    }
}

// Create the HTML side panel list of comics.
function LoadComicList(comicMetadata) {

    let comics = comicMetadata['Comics'];
    
    // Write out the comic list.
    let comicList = "";
    comicList = comicList +"<li class='sidebar-brand'> Comics </li>";
    
    for (i = 0; i < comics.length; i++) {
        let comic = comics[i];
        let comicTitle = comic['ComicTitle'];
        let comicTags = comic['Tags'];
        let comicFileName = comic['MetadataFileName'];
        let comicAlias = GetComicAliasFromFilename(comicFileName);
        let comicUnreadCount = FormatUnreadCount(GetUnreadCount(comicAlias));
                        
        // Do not show comics that contain any hidden tags.
        let HiddenTags = SessionGetHideTagList();
        if (!ListContainsAny(comicTags, HiddenTags))
        {
            // TODO: use with Session instead of tags to form favorites
            if (ListContainsValue(comicTags, STAR_TAG)){
                comicTitle = comicTitle + "<span style='color:#9c0909;'>*</span>";
            }
            
            comicList = comicList 
            +'<li><a' + ' '
            + 'style="cursor: pointer;"' + ' '
            + 'onclick="LoadComic(' + "'" + comicFileName +"'" +');" >' 
            + comicTitle 
            + ' '
            +'<span class="badge" style="text-indent: 0px;" id="' + ConstructComicUnreadId(comicAlias) + '">' + comicUnreadCount + '</span>'
            + '</a></li>';
        }
    }
    
    return comicList;
}

function FindComicMetadata(comicAlias){
    let comicMetadata = GetComicMetadata();
    let searchComicFilename = GetComicFilenameFromAlias(comicAlias);
    
    let comics = comicMetadata['Comics'];
    
    let i;
    for (i = 0; i < comics.length; i++) {
        let comic = comics[i];
        let comicFilename = comic['MetadataFileName'];
        
        if (searchComicFilename == comicFilename) {
            return comic;
        }
    }
    
    return undefined;
}

let LoadingComic = false;
function LoadComic(comicFileName){
    if (LoadingComic) {
        return;
    }
    LoadingComic = true;
    DisplayComic();
    
    
    
    // Format Comic page based off of static server sider Json file.
    
    let comicFile = COMIC_BASE_PATH + comicFileName;
    
    let comicData = LoadFileJson(comicFile);

    let comicAlias = GetComicAliasFromFilename(comicFileName);
    
    let comicMetadata = FindComicMetadata(comicAlias);
    
    // Comic Metadata properties.
    let comicTitle = comicMetadata['ComicTitle'];
    let lastUpdateTime = comicMetadata['LastUpdateDate'];
    
    document.getElementById('comic_title').innerHTML = comicTitle;
    document.getElementById('comic_updatetime').innerHTML = lastUpdateTime;
    
    let comicPages = comicData['Pages'];
    let i = 0;
    let comicPageTableText = "";
    
    for (i = 0; i < comicPages.length; i++) {
        let page = comicPages[i];
        
        let sequenceNumber = page['SequenceNumber'];
        let pageLink = page['PageLink'];
        let pageTitle = page['TitleText'];
        
        let style = "";
        
        if ( "" == pageTitle || undefined == pageTitle) {
            pageTitle = sequenceNumber;
        }
        
        comicPageTableText = comicPageTableText + "<tr><td>" 
        + '<a href="' + pageLink + '"' + " "
        + 'id="' + ConstructComicLinkId(comicAlias, sequenceNumber) + '"' + " "
        + 'target="_blank"' + " "
        + 'onclick="ComicLinkClicked(' + "'" + comicAlias + "'" +"," + String(sequenceNumber) +  ');"' + " "
        +'>'
        + pageTitle
        + "</a></td></tr>";
    }
    document.getElementById('comic_pages').innerHTML = comicPageTableText;
    
    let lastComicNumber = SessionGetLastComicNumber(comicAlias);
    ToggleLastComicStyleOn(comicAlias, lastComicNumber);
    LoadingComic = false;
}

function ConstructComicLinkId(comicAlias, sequenceNumber) {
    return comicAlias + '_' + String(sequenceNumber);
}

function ConstructComicUnreadId(comicAlias) {
    return comicAlias + '_unread';
}

function GetComicAliasFromFilename(comicFileName) {
    return comicFileName.split(".Metadata.json",1)[0];
}

function GetComicFilenameFromAlias(comicAlias) {
    return comicAlias + ".Metadata.json";
}

function GetUnreadCount(comicAlias) {
    let comicMetadata = FindComicMetadata(comicAlias);
    let latestComicNumber = comicMetadata["LastComicNumber"];
    let lastReadComicNumber = SessionGetLastComicNumber(comicAlias);
    let newComicCount = latestComicNumber - lastReadComicNumber;

    return newComicCount;
}

function SetUnreadCount(comicAlias) {
    let unreadId = ConstructComicUnreadId(comicAlias);
    let unreadElement = document.getElementById(unreadId);
    let unreadCount = GetUnreadCount(comicAlias);
    let displayUnreadCount = FormatUnreadCount(unreadCount);
    unreadElement.innerHTML = displayUnreadCount;
}

function FormatUnreadCount(comicUnreadCount) {
    let stringComicUnreadCount = undefined;
    
    if (0 == comicUnreadCount) {
        stringComicUnreadCount = "";
        
    } else if ( 0 < comicUnreadCount) {
        stringComicUnreadCount = String(comicUnreadCount);

    } else if ( 0 > comicUnreadCount) {
        // Happens if a reindexing occurs on a site.
        stringComicUnreadCount = "?";
    }
    return stringComicUnreadCount;
}

function ToggleLastComicStyleOn(comicAlias, sequenceNumber) {
    // Style choice to not to show one for 0.
    if (0 != sequenceNumber) {
        document.getElementById(ConstructComicLinkId(comicAlias, sequenceNumber)).style.color = "red";
    }
}

function ToggleLastComicStyleClear(comicAlias, sequenceNumber) {
    try {
        document.getElementById(ConstructComicLinkId(comicAlias, sequenceNumber)).style.color = "";
    } catch (err) {
        console.log(err.message);
    }
}

function ComicLinkClicked(comicAlias, sequenceNumber){
    let lastComicNumber = SessionGetLastComicNumber(comicAlias);
    ToggleLastComicStyleClear(comicAlias, lastComicNumber);

    SessionSetLastComicNumber(comicAlias, sequenceNumber);
    ToggleLastComicStyleOn(comicAlias, sequenceNumber);
    SetUnreadCount(comicAlias);
}

function DisplayLastVisitTime() {
    let displayText = "Welcome!";

    let lastVisitTime = SessionGetLastVisitTime();
    if (lastVisitTime != undefined) {
        let lastVisitTime = Session["LastVisitTime"];
        
        let millisecondsSinceLastVisit = Date.now() - lastVisitTime;
        
        // Constants for math.
        let SECOND_MILLISECONDS = 1000;
        let MINUTE_MILLISECONDS = SECOND_MILLISECONDS * 60;
        let HOUR_MILLISECONDS = MINUTE_MILLISECONDS * 60;
        let DAY_MILLISECONDS = HOUR_MILLISECONDS * 24;
        
        // Since last visit.
        let days = Math.floor( millisecondsSinceLastVisit / DAY_MILLISECONDS);
        let hours = Math.floor( (millisecondsSinceLastVisit % DAY_MILLISECONDS) / HOUR_MILLISECONDS);
        let minutes = Math.floor( (millisecondsSinceLastVisit % HOUR_MILLISECONDS) / MINUTE_MILLISECONDS);
        let seconds = Math.floor( (millisecondsSinceLastVisit % MINUTE_MILLISECONDS) / SECOND_MILLISECONDS);
        
        let greatestUnitCount = "";
        let greatestUnitName = "" 
        
        if (0 != days){
            greatestUnitCount = days; 
            greatestUnitName = "Day";
        
        } else if (0 != hours){
            greatestUnitCount = hours;
            greatestUnitName = "Hour";
        
        } else if (0 != minutes){
            greatestUnitCount = minutes;
            greatestUnitName = "Minute";
        
        } else if (0 != seconds){
            greatestUnitCount = seconds;
            greatestUnitName = "Second";
        
        } else {
            greatestUnitCount = millisecondsSinceLastVisit;
            greatestUnitName = "Milisecond";
        }			
        
        // Proper usage of plural.
        if (greatestUnitCount > 1) {
            greatestUnitName = greatestUnitName + "s";
        }
        
        displayText =  "Last visit " + String(greatestUnitCount) + " " + greatestUnitName + " ago.";
    
    }
    
    document.getElementById("LastVisitTime").innerHTML = displayText;
    
    SessionSetLastVisitTime();
}
