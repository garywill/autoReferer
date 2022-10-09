async function on_optionpage_load() {

    settings = await browser.storage.local.get() ;
    //console.log(settings);
    
    
    if (settings['workaround'] === true) 
        document.getElementById("checkbox-workaround").checked = true;
    if (settings['easycpu'] === true)
        document.getElementById("checkbox-easycpu").checked = true;
    

    document.getElementById("checkbox-workaround").addEventListener("change", async function () {
        //console.log("workaround checkbox changed");
        
        await browser.storage.local.set({
                "workaround": document.getElementById("checkbox-workaround").checked 
        });
        
        browser.runtime.sendMessage({
            action: "re-globalEnable-if-is-enabled"
        });

    });
    
    document.getElementById("checkbox-easycpu").addEventListener("change", async function () {
        //console.log("easycpu checkbox changed");
        
        await browser.storage.local.set({
                "easycpu": document.getElementById("checkbox-easycpu").checked 
        });
        
        browser.runtime.sendMessage({
            action: "re-globalEnable-if-is-enabled"
        });

    });
    
    
}

on_optionpage_load();

