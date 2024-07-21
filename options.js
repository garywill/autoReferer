

async function get_settings_local()
{
    return ( await browser.storage.local.get() ) ;
}

async function get_settings_sync()
{
    return ( await browser.storage.sync.get() ) ;
}


document.addEventListener("DOMContentLoaded", async function() {
    // kill js referer bug
    (async () => {
        if ( ( await get_settings_local() ) ['workaround'] === true) 
            document.getElementById("checkbox-workaround").checked = true;
    } ) () ;
    
    (async () => {
        document.getElementById("checkbox-workaround").addEventListener("change", async function () {
            //console.log("workaround checkbox changed");
            
            await browser.storage.local.set({
                    "workaround": document.getElementById("checkbox-workaround").checked 
            });
            
            browser.runtime.sendMessage({
                action: "re-globalEnable-if-is-enabled"
            });

        });
    } ) () ;
    
    
    
    // ease cpu
    (async () => {
        if ( ( await get_settings_local() ) ['easycpu'] === true)
            document.getElementById("checkbox-easycpu").checked = true;
    } ) () ;    
    
    (async () => {
        document.getElementById("checkbox-easycpu").addEventListener("change", async function () {
            //console.log("easycpu checkbox changed");
            
            await browser.storage.local.set({
                    "easycpu": document.getElementById("checkbox-easycpu").checked 
            });
            
            browser.runtime.sendMessage({
                action: "re-globalEnable-if-is-enabled"
            });

        });
    } ) () ;
    
    
    
    
    // user whitelist
    async function load_userWhitelist() 
    {
        const loaded_obj = ( await get_settings_sync() ) ['user_whitelist'] ;
        document.getElementById("textarea_userWhitelist").value = JSON.stringify( loaded_obj, null, 2); 
    } 
    load_userWhitelist();
    
    (async () => {
        document.getElementById("btn_save_userWhitelist").onclick = async function() {
            var parsed_obj ;
            try{
                parsed_obj = JSON.parse( document.getElementById("textarea_userWhitelist").value );
            }catch(err) {
                alert(err);
            }
            
            if (parsed_obj)
            {
                await browser.storage.sync.set("user_whitelist", parsed_obj);
                load_userWhitelist();
            }
            
        };
    } ) () ; 
    
    
    // build in whitelist
    (async () => {
        if ( ( await get_settings_sync() ) ['enBuildinWhitelist'] !== false)
            document.getElementById("checkbox-enBuildinWhitelist").checked = true;
    } ) () ;    
    (async () => {
        document.getElementById("checkbox-enBuildinWhitelist").addEventListener("change", async function () {
            await browser.storage.sync.set({
                "enBuildinWhitelist": document.getElementById("checkbox-enBuildinWhitelist").checked 
            });
        });
    } ) () ;
    // show build in whitelist
    (async () => {
        document.getElementById("textarea_buildinWhitelist").value = JSON.stringify( whitelist , null, 2);
    } ) () ; 
    
} ) ;










