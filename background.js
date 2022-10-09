const addon_name = "Auto Referer";
const default_title = addon_name;

setGlobalEnable();
    // TODO .onion .i2p
//----------------------------------------------------------

/*
NOTICE 
    delete for Chrome
*/
async function onBeforeRequest_main(details)
{
    if (await is_off(details)) 
        return;
    
    //const resourceType = details.type;
    const tabid = details.tabId;
    const method = details.method;

    var targetUrl = null;
    var targetHost = null;
//     var documentUrl = null;
//     var documentHost = null;
    var originUrl = null
    var originHost = null
    
    if (details.url) {
        targetUrl = details.url.toLowerCase() || details.url ;
        targetHost = getUrlHost(targetUrl) ;
    }
    
//     if (details.documentUrl) {
//         documentUrl = details.documentUrl.toLowerCase() || details.documenUrl ;
//         documentHost = getUrlHost(documentUrl);
//     }
    
    if (details.originUrl) {
        originUrl = details.originUrl.toLowerCase() || details.originUrl ;
        originHost = getUrlHost(originUrl);
    } 
    
    if (method != "GET")
        return;
    
    if (!originUrl) 
        return;
    
    for ( unhandled of ["moz-extension:", "chrome-extension:", "about:", "file:", "chrome:", "javascript:", "data:"] )
        if ( targetUrl.startsWith(unhandled) || originUrl.startsWith(unhandled) )
            return;
    
    for ( str of whitelist )
        if (originHost.endsWith(str) && targetHost.endsWith(str) )
            return;
    
    if (
    ( targetHost !== originHost )
    ||
    ( 
        ( originUrl.startsWith("https://") ||
        originUrl.startsWith("wss://") )
        && 
        ( targetUrl.startsWith("http://") ||
        targetUrl.startsWith("ws://") )
    )
    )
    {
        browser.tabs.executeScript(
            tabid,
            {
                runAt: "document_start",
                code: `window.location.href="${targetUrl}";`
            }
        );
    }
}

async function onBeforeSendHeaders(details)
/*
NOTICE Chrome doesn't allow async function here
    Change it to sync function for Chrome
*/
{
    if (await is_off(details)) 
        return;
    
    const resourceType = details.type;
    
    var targetUrl = null;
    var targetHost = null;
    var documentUrl = null;
    var documentHost = null;
    var originUrl = null
    var originHost = null
    
    if (details.url) {
        targetUrl = details.url.toLowerCase() || details.url ;
        targetHost = getUrlHost(targetUrl) ;
    }
    
    if (details.documentUrl) {
        documentUrl = details.documentUrl.toLowerCase() || details.documenUrl ;
//         documentHost = getUrlHost(documentUrl);
    }
    
    if (details.originUrl) {
        originUrl = details.originUrl.toLowerCase() || details.originUrl ;
        originHost = getUrlHost(originUrl);
    } 
    
    if (resourceType == "main_frame")
        for ( str of whitelist )
            if (originHost.endsWith(str) && targetHost.endsWith(str) )
                return;
    
    
    for (var i=0; i<details.requestHeaders.length; i++)
    {
        const cur_header = details.requestHeaders[i];
        if (cur_header.name.toLowerCase() === "referer" ||
            cur_header.name.toLowerCase() === "referrer"
        )
        {
            var newReferer = null;
            newReferer = getNewReferer(targetUrl, cur_header.value, resourceType == "main_frame", resourceType == "sub_frame", documentUrl);
            
            cur_header.value = newReferer;
            if (!newReferer)
            {
                details.requestHeaders.splice(i,1);
                i--;
            }
        }
    }
    
    return {requestHeaders: details.requestHeaders};
}


//===================================================
// referer policy
function getNewReferer(targetUrl, oldReferer="", isTop, isSubframeTop, documentUrl){ 
    var newReferer = "";
    
    const targetHost = getUrlHost(targetUrl);
    const oldRefererHost = getUrlHost(oldReferer);
    
    if (isTop)
        if ( targetHost === oldRefererHost )
            newReferer = removeUrlParts(oldReferer);
        else 
            newReferer = "";
    else if (isSubframeTop)
        if ( targetHost === oldRefererHost ||
            getUrlHost(documentUrl) === oldRefererHost
        )
            newReferer = removeUrlParts(oldReferer);
        else 
            newReferer = "";
    else
        newReferer = removeUrlParts(oldReferer);


    
    // when httpS to http (downgrade)
    if ( 
        ( oldReferer.toLowerCase().startsWith("https://") ||
        oldReferer.toLowerCase().startsWith("wss://") )
        && 
        ( targetUrl.startsWith("http://") ||
        targetUrl.startsWith("ws://") )
    )
        newReferer = "";
    
    // when url is other strange format that we don't know
    if ( !targetHost || !oldRefererHost )
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
