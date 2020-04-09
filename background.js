chrome.webRequest.onBeforeSendHeaders.addListener(
    rewriteRefererHeader,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
); 

var enabled = true;

function rewriteRefererHeader(e)
{
    if (!enabled) return;
    const targetURL = e.url;
    const resourceType = e.type;
    const documentUrl = e.documentUrl;
    const originUrl = e.originUrl;
    
    if (resourceType == "main_frame")
    {
        for (var i=0;i<e.requestHeaders.length;i++)
        {
            if (e.requestHeaders[i].name.toLowerCase() === "referer")
            {
                if ( getUrlHost(e.requestHeaders[i].value) == getUrlHost(targetURL) )
                {
                    e.requestHeaders[i].value = removeUrlParts( e.requestHeaders[i].value );
                }else{
                    e.requestHeaders.splice(i,1);
                    break;
                }
            }
        }
    }else{
        var obj_referer = null;
        for(var header of e.requestHeaders) {
            if(header.name.toLowerCase() === "referer" && header.value) {
                obj_referer = header;
                break;
            }
            
        }
        
        if (obj_referer) obj_referer.value = removeUrlParts(obj_referer.value);
    }
    return {requestHeaders: e.requestHeaders};
}

function removeUrlParts(s)
{
    try{
        var arr = s.split("/");
        var result = arr[0] + "//" + arr[2] + "/";
        
        return result;
    }catch(e){
        return s;
    }
}

function getUrlHost(s)
{
    try{
        var arr = s.split("/");
        var result = arr[2]
        
        return result;
    }catch(e){
        return s;
    }
}

browser.browserAction.onClicked.addListener(() => {
    enabled = !enabled;
    setBadgeStatus();
    
});

function setBadgeStatus(s)
{   
    if (!enabled)
    {
        browser.browserAction.setBadgeText({ text: "D" });
        browser.browserAction.setBadgeBackgroundColor({ color: "#dd0000" });
        browser.browserAction.setTitle({title: "Auto Referer (Disabled)"});
    }
    else{
    
        browser.browserAction.setBadgeText({ text: "" });
        browser.browserAction.setBadgeBackgroundColor({ color: "#00BF00" });
        browser.browserAction.setTitle({title: ""});
    }
}
