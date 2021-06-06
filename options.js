async function on_optionpage_load() {

    settings = await browser.storage.local.get() ;
    //console.log(settings);
    
    
    if (settings['workaround'] === true) 
        document.getElementById("checkbox-workaround").checked = true;

    document.getElementById("checkbox-workaround").addEventListener("change", async function () {
        //console.log("workaround checkbox changed");
        
        await browser.storage.local.set({
                "workaround": document.getElementById("checkbox-workaround").checked 
        });
        
        browser.runtime.sendMessage({
            action: "re-globalEnable-if-is-enabled"
        });

    });
    
}

on_optionpage_load();

