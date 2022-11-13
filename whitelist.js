var whitelist = [
    [ ".taobao.com", ".alipay.com", ".tmall.com" ], 
    
    ".cnki.net", 
    
    "gitlab.com", 
];

function is_whitelisted(originHost, targetHost)
{
    console.debug("is_whitelisted()", originHost, targetHost);
    for ( ele of whitelist )
    {
        if ( typeof(ele) === "string" )
        { 
            const str = ele;
            if (originHost.endsWith(str) && targetHost.endsWith(str) )
            {
                return true;
            } 
        }
        else if ( Array.isArray(ele) )
        {
            const strArr = ele;
            
            var originW = false;
            var targetW = false;
            
            for (str of strArr)
                if ( originHost.endsWith(str) )
                {
                    originW = true;
                    break;
                }

            if (originW)
                for (str of strArr)
                    if ( targetHost.endsWith(str) )
                    {
                        return true;
                    }
        }
    }
}



