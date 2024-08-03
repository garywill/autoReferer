const buildin_whitelist = [
    "gitlab.com", 
    
    [ "taobao.com", "alipay.com", "tmall.com", "goofish.com", "alibabagroup.com", "aliexpress.com", "alibaba.com", "1688.com",  "alimama.com" ], 
    
    ["apple.com", "cdn-apple.com", "itunes.com"], 
    
    ["bing.com", "login.live.com", "login.microsoftonline.com"], 
    
    ["cnki.net", "edu.cn", "szlib.org.cn", "zjlib.cn", "library.hb.cn",  "gxlib.org.cn"], 
    
    ["ixigua.com", "douyin.com", "toutiao.com"], 
    
    [
        "jlc.com", "szlcsc.com", "lceda.cn", "jlcsmt.com",  "oshwhub.com" , "jlc-3dp.cn", "sanweihou.com",  "jlc-smt.com", "jlc-gw.com", "jlc-fpc.com",  "jlc-bbs.com", "forface3d.com", "jlcfa.com", "jlc-cnc.com", "jlcsj.com", "jlccam.com",  "jlcgroup.cn" , 
        
        "jlcpcb.com", "easyeda.com",  "jlc3dp.com", "jlcmc.com", "oshwlab.com", 
    ], 
];


let whitelist = [];
async function whitelist_init() {
    async function get_settings_sync()
    {
        return ( await browser.storage.sync.get() ) ;
    }

    if ( ( await get_settings_sync() ) ['enBuildinWhitelist'] !== false)
    { 
        whitelist = whitelist.concat(buildin_whitelist);
    }
}
whitelist_init();



function is_whitelisted_single(host)
{
    // console.debug("is_whitelisted_single()", host);
    
    if (!host)
        return;
    
    for ( ele of whitelist )
    {
        if ( typeof(ele) === "string" )
        { 
            const str = ele;
            if ( host === str || host.endsWith('.'+str) )
            {
                return true;
            } 
        }
        else if ( Array.isArray(ele) )
        {
            const strArr = ele;
            
            for (subEle of strArr)
            {
                const str = subEle;
                if ( host === str || host.endsWith('.'+str) )
                {
                    return true;
                } 
            }
        }
    }
    
}

function is_whitelisted(originHost, targetHost)
{
    // console.debug("is_whitelisted()", originHost, targetHost);
    
    if (!originHost || !targetHost)
        return;
    
    for ( ele of whitelist )
    {
        if ( typeof(ele) === "string" )
        { 
            const str = ele;
            if (
                ( originHost === str || originHost.endsWith('.'+str) )
                && (targetHost === str || targetHost.endsWith('.'+str) )
            )
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
                if ( originHost === str || originHost.endsWith('.'+str) )
                {
                    originW = true;
                    break;
                }

            if (originW)
                for (str of strArr)
                    if (targetHost === str || targetHost.endsWith('.'+str) )
                    {
                        targetW = true;
                        return true;
                    }
        }
    }
}



