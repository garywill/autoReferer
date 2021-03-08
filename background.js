const addon_name = "Auto Referer";
const default_title = addon_name;

var global_enabled = false; 

var list_w_disable = []; // window off list
var list_h_disable = []; // tab and sub tabs off list
var list_t_disable = []; // tab off list

setGlobalEnable();

browser.tabs.onRemoved.addListener( (tabid, removeInfo) => {
    const wid = removeInfo.windowId;
    normalizeTab(tabid);
});
browser.windows.onRemoved.addListener((wid) => {
    unsetWindowDisabled(wid);
});
browser.browserAction.onClicked.addListener((tab) => {
    const tabid = tab.id;
    const wid = tab.windowId;
    
    if ( ! isTabIn_list_h(tabid) && ! isTabIn_list_t(tabid) )
    {
        setTab_t(tabid);
    }else if ( isTabIn_list_t(tabid) ) 
    {
        setTab_h(tabid);
    }else if ( isTabIn_list_h(tabid) )
    {
        normalizeTab(tabid);
    }
    
});
browser.tabs.onCreated.addListener( (tab) => {
    if ( isTabIn_list_h(tab.openerTabId) ) {
        setTab_h(tab.id);
    }
});
//----------------------------------------------------------

browser.webRequest.onBeforeSendHeaders.addListener(
    onBeforeSendHeaders,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
); 

async function onBeforeSendHeaders(details)
{
    try{ 
        const tabid = details.tabId;
        if ( tabid < 0 ) return;
        if ( ! global_enabled ) return;
        if (isTabIn_list_h(tabid) || isTabIn_list_t(tabid) ) return;
        const wid = (await browser.tabs.get(tabid)).windowId;
        if( isWindowDisabled( wid ) ) return;
        
        const targetURL = details.url;
        const resourceType = details.type;
        //const documentUrl = details.documentUrl;
        //const originUrl = details.originUrl;
        
        for (var i=0; i<details.requestHeaders.length; i++)
        {
            const cur_header = details.requestHeaders[i];
            if (cur_header.name.toLowerCase() === "referer" ||
                cur_header.name.toLowerCase() === "referrer"
            )
            {
                var newReferer = null;
                newReferer = getNewReferer(targetURL, cur_header.value, resourceType == "main_frame", resourceType == "sub_frame");
                
                cur_header.value = newReferer;
                if (!newReferer)
                    details.requestHeaders.splice(i,1);
            }
        }
        
        return {requestHeaders: details.requestHeaders};
    } catch(err){ 
        if ( ! err.message.startsWith("Invalid tab ID:") )   console.error(err);
    }
}


//===================================================
// referer policy
function getNewReferer(targetURL, oldReferer="", isTop, isSubframeTop){ 
    var newReferer = "";
    
    if (isTop || isSubframeTop)
        if ( getUrlHost(targetURL) === getUrlHost(oldReferer) )
            newReferer = removeUrlParts(oldReferer);
        else 
            newReferer = "";
    else
        newReferer = removeUrlParts(oldReferer);


    
    // when httpS to http (downgrade)
    if ( oldReferer.toLowerCase().startsWith("https://") && targetURL.toLowerCase().startsWith("http://") )
        newReferer = "";
    
    // when url is other strange scheme that we don't know
    if ( !getUrlHost(targetURL) || !getUrlHost(oldReferer) ) 
        newReferer = "";
    
    // make sure referer only starts with http or https
    if (!newReferer.toLowerCase().startsWith("https://") &&
        !newReferer.toLowerCase().startsWith("http://")
    )
        newReferer = "";
    
    return newReferer;
}
function removeUrlParts(s) // 'http://example.com:8888/a/b/c' --> 'http://example.com:8888/'
{
    try{
        var arr = s.split("/");
        var result = arr[0] + "//" + arr[2] + "/";
        return result;
    }catch(err){
        console.error(err);
        return s;
    }
}
function getUrlHost(s) // 'http://example.com:8888/a/b/c' --> 'example.com:8888'
{
    try{
        var arr = s.split("/");
        var result = arr[2]
        return result;
    }catch(err){
        console.error(err);
        return s;
    }
}
}
