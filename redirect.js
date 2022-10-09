document.addEventListener("DOMContentLoaded", async function() {
    const docHref = document.location.href;
    const urlParser = new URL(docHref);
    var targetUrl = decodeURIComponent( urlParser.searchParams.get("targeturl") );
    
    document.getElementById("a_targetUrl").href = targetUrl;
    document.getElementById("span_targetUrl").textContent = targetUrl;
    
    document.title = `${ (new URL(targetUrl) ) .host} (${document.title})`;
    
    document.location.replace ( targetUrl );
    
    
});
