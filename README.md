# Auto Referer

Control HTTP referer to protect privacy and not break web.

- [Firefox Addon](https://addons.mozilla.org/firefox/addon/auto-referer/)
- [Chrome Addon](https://chrome.google.com/webstore/detail/auto-referer/dafnjeokmkpjdlfgllccdenmikeglgab) (Manifest v2 needed)

**Notice**: Due to browser bug on javascript `document.referrer` on **Firefox** 69+ ([1601496](https://bugzilla.mozilla.org/show_bug.cgi?id=1601496), [1601743](https://bugzilla.mozilla.org/show_bug.cgi?id=1601743)) (also on **Chrome**), using a regular referer controlling addon you can get 70% of expected protection until they fix that bug. 

So, **we've implemented a workaround to improve protection to 85%. Please enable workaround in addon settings** .

## Referer Policy of this Addon

1. For webs' top frame (i.e. clicking link, navigating, redirecting etc.):
   
   1. If origin and target url have same domain, allow trimmed referer
   
   2. If origin and target url have different domain, no referer 

2. For in-page resources (images, videos, js, css etc.), allow trimmed referer (this is **the key to not break** most webs, also a balance between privacy and experience)

3. Trim referer: Any referer should be no more than `http(s)://domain-name:port/` (like Firefox's native `about:config` setting `network.http.referer.trimmingPolicy = 2`).

4. Not allow referer that not starts with "http" or "https". (Please feedback if you find something broken due to this)

5. No referer when downgrade from HTTPS/WSS to HTTP/WS

We believe that can protect privacy enough and won't break web.

### `document.referrer` bug workaround

This addon doesn't use content script. Content script hiding `document.referrer` is not 100% reliable.

**Instead, we use this workaround to kill `document.referrer`**: 

Cancel all cross-domain navigating requests and make freshnew ones, like directly hit (currently only implemented for GET method and main frame, other methods and sub-frames remain as is)

### Fallback operation

If user find a web broken, user can temporary set this addon disabled via toolbar button for:

- this one tab
- this one tab and new tabs opened by this tab
- this one window (Firefox only)
- globally

(above can be set as keyboard shortcuts)

there's showy toolbar button badge indicating fallback disabling status.

### Allowlist

We currently have built-in allowlist (hard-coded. user-define allowlist not yet implemented), for the purpose of not breaking some websites. Some companies have many different websites with different domains. Some of their functionality are based on redirecting between their websites. Some of them check referer. User can choose to disable built-in allowlist.


## How to build

Install gpp. Run `build.sh`

## Disclaimer

This open souce addon comes with no warranty. Use on you own risk!

