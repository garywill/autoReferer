# autoreferer
Firefox addon. Control referer to protect privacy and not break web.

HTTP header referer control policy:
1. Any referer sent contain no more than `protocol://domain-name:port/`
1. For web page's main frame:
    1) If origin and target url have same domain, send referer
    2) If origin and target url have different domain, no referer
1. For web page resources, send referer

I believe that can protect privacy enough and won't break web. If you find anything unexpected, welcome feedback.
