chrome.webRequest.onBeforeSendHeaders.addListener(
    rewriteRefererHeader,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
); 

function rewriteRefererHeader(e)
{
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
        var result = arr[0] + "//" + arr[2]
        
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
