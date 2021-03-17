const addon_name = "Auto Referer";
const default_title = addon_name;

setGlobalEnable();

//----------------------------------------------------------

async function onBeforeSendHeaders(details)
{
    if (await is_off(details=details)) return;
    
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
    if ( 
        ( oldReferer.toLowerCase().startsWith("https://") ||
        oldReferer.toLowerCase().startsWith("wss://") )
        && 
        ( targetURL.toLowerCase().startsWith("http://") ||
        targetURL.toLowerCase().startsWith("ws://") )
    )
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
