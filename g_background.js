const addon_name = "Auto Referer";
const default_title = addon_name;

setGlobalEnable();
    // TODO .onion .i2p
//----------------------------------------------------------


/* 
* webRequest details:
* Firefox:
*      top-frame html request:
*              originUrl: the url which user was visiting before this navigation
*              documentUrl: undefined
*      in-page link request from in main-frame: 
*              originUrl = documentUrl
*      in-page link request from in iframe: 
*              originUrl: iframe's src 
*              documentUrl: parent frame's url
* Chrome: initiator (can be string 'null')
*/


// main_frame only
// cancel old request and make new
#ifndef CHROME
async function onBeforeRequest_main(details)
#else
      function onBeforeRequest_main(details)
#endif
{
  // console.debug("onBeforeRequest_main()", details.tabId, details.type , details.url);
    
    if (
        #ifndef CHROME
        await is_off(details)
        #else
              is_off(details)
        #endif
    ) 
    {
      // console.debug("return (off)");
        return;
    } 
    
    //const resourceType = details.type;
    const tabid = details.tabId;
    const method = details.method;

    var targetUrl = "";
    var targetHost = "";
//     var documentUrl = "";
//     var documentHost = "";
    var originUrl = ""
    var originHost = ""
    
    if (details.url) {
        targetUrl = details.url.toLowerCase() || details.url ;
        targetHost = getUrlHost(targetUrl) ;
    }
    
//     if (details.documentUrl) {
//         documentUrl = details.documentUrl.toLowerCase() || details.documenUrl ;
//         documentHost = getUrlHost(documentUrl);
//     }
    
    if (isFirefox ? details.originUrl : details.initiator) {
        if (isFirefox)
            originUrl = details.originUrl.toLowerCase() || details.originUrl ;
        else
            originUrl = details.initiator.toLowerCase() || details.initiator ;
        originHost = getUrlHost(originUrl);
    } 
    
    if (method != "GET")
    {
      // console.debug("return (not GET)");
        return;
    } 
    
    if (!originUrl) 
    {
      // console.debug("return (no originUrl)");
        return;
    } 
    
    for ( unhandled of ["moz-extension:", "chrome-extension:", "about:", "file:", "chrome:", "javascript:", "data:"] )
        if ( targetUrl.startsWith(unhandled) || originUrl.startsWith(unhandled) )
        {
          // console.debug("return (protocol unhandled)", originUrl, "--> ",  targetUrl);
            return;
        }
    
    if (is_whitelisted( originHost, targetHost) )
    {
        console.debug("return (whitelisted)");
        return; 
    }

    
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
      // console.debug("stopping the request and make a new one. The details of current request:", details );
        
        // no longer works on ff102 
//         browser.tabs.executeScript(
//             tabid,
//             {
//                 runAt: "document_start",
//                 code: `window.location.href="${targetUrl}";`  // don't use targetUrl because it is toLowerCase()ed
//             }
//         );
        
        // doesn't work if the link target isn't "_blank"
//         browser.tabs.update(tabid, {url: detals.url });
        
        var urlEncoder = new URL( chrome.runtime.getURL("redirect.html") );
        urlEncoder.searchParams.set("targeturl", details.url);
        
        #ifndef CHROME
        await
        #endif 
        browser.tabs.update(tabid, {url: urlEncoder.href });
        
        // on some browser (e.g. Firefox version ~100), if return cancel=true, it will also make above update cancled  
        if (isChrome)
            return {cancel: true};
    }
}


// any request type, including main_frame
// change http header
#ifndef CHROME
async function onBeforeSendHeaders(details)
#else
      function onBeforeSendHeaders(details)
#endif
{
  // console.debug("onBeforeSendHeaders()", details.tabId, details.type , details.url);
    
    if (
        #ifndef CHROME
        await is_off(details)
        #else
              is_off(details)
        #endif
    ) 

    {
        // console.debug("return (off)");
        return;
    } 
    // console.debug("here 10", details.type);
    
    const resourceType = details.type;
    
    var targetUrl = "";
    var targetHost = "";
    var documentUrl = "";
    var documentHost = "";
    var originUrl = ""
    var originHost = ""
    
    if (details.url) {
        targetUrl = details.url.toLowerCase() || details.url ;
        targetHost = getUrlHost(targetUrl) ;
    }
    
    if (details.documentUrl) {
        documentUrl = details.documentUrl.toLowerCase() || details.documenUrl ;
//         documentHost = getUrlHost(documentUrl);
    }
    
    if (isFirefox ? details.originUrl : details.initiator) {
        if (isFirefox)
            originUrl = details.originUrl.toLowerCase() || details.originUrl ;
        else
            originUrl = details.initiator.toLowerCase() || details.initiator ;
        originHost = getUrlHost(originUrl);
    } 
    
    // console.debug("here 22", details.type);
    if (resourceType == "main_frame" && originHost && originHost != targetHost) {
        if (is_whitelisted( originHost, targetHost) )
        {
            // console.debug("return (whitelisted A)");
            return; 
        }
    }else {
        if (is_whitelisted_single(originHost))
        {
            // console.debug("return (whitelisted B)");
            return; 
            
        }
    }
    
    
    // console.debug("here 33");
    for (var i=0; i<details.requestHeaders.length; i++)
    {
        const cur_header = details.requestHeaders[i];
        if (cur_header.name.toLowerCase() === "referer" ||
            cur_header.name.toLowerCase() === "referrer"
        )
        {
//             // console.debug("old referer:", cur_header.value);
            
            var newReferer = null;
            newReferer = getNewReferer(targetUrl, cur_header.value, resourceType == "main_frame", resourceType == "sub_frame", documentUrl);
            
            // console.debug("new referer:", newReferer, "while", details.type, "visiting", details.url);
            cur_header.value = newReferer;
            if (!newReferer)
            {
                // console.debug("splicing referer header");
                details.requestHeaders.splice(i,1);
                i--;
            }
        }
    }
    
    // console.debug("here 44");
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
        {
            // console.debug("here 11");
            newReferer = removeUrlParts(oldReferer);
        } 
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
