# Auto Referer

Firefox addon. Control referer to protect privacy and not break web.


**Notice**: Due to browser bug on javascript `document.referrer` on Firefox 69+ ([1601496](https://bugzilla.mozilla.org/show_bug.cgi?id=1601496), [1601743](https://bugzilla.mozilla.org/show_bug.cgi?id=1601743)), using this addon we can get 70% of expected protection until Mozilla fixes that bug.

Referer policy:

1. For webs' top frame (i.e. clicking link, navigating, redirecting etc.):
   
   1. If origin and target url have same domain, allow trimmed referer
   2. If origin and target url have different domain, no referer

2. For in-page resources (images, videos, js, css etc.), allow trimmed referer (this is **the key to not break** most webs, also a balance between privacy and experience)

3. Trim referer: Any referer should be no more than `http(s)://domain-name:port/` (like Firefox's native `about:config` setting `network.http.referer.trimmingPolicy = 2`).

4. Not allow referer that not starts with "http" or "https". (Please feedback if you find something broken due to this)

5. No referer when downgrade from HTTPS to HTTP

I believe that can protect privacy enough and won't break web.

If user find a web broken, user can temporary set this addon disabled via toolbar button for:

- this one tab
- this one tab and new tabs opened by this tab
- this one window
- globally

there's toolbar button badge indicating disabling status.
