function StreamMonitor(){function f(b){if(-1!=b.tabId){var c=-1,e="",d="";if(b.responseHeaders)for(var a=0;a<b.responseHeaders.length;++a)if("content-type"==b.responseHeaders[a].name.toLowerCase())e=(b.responseHeaders[a].value||"").trim();else if("content-length"==b.responseHeaders[a].name.toLowerCase()){if(c=parseInt(b.responseHeaders[a].value),isNaN(c)||!isFinite(c))c=-1}else"content-disposition"==b.responseHeaders[a].name.toLowerCase()&&(d=(d=b.responseHeaders[a].value)?(d=d.match(/filename=\"([^\"]+)\"/i))?
d[1]||"":"":"");a=xtractFile(d).fext||fext_from_url(b.url);if(e&&g.test(e)||a&&h.test(a))a||(e=e.match(/(?:[^\/]+)\/(?:x-)?(?:vnd\.)?(.+)/i))&&e[1]&&(a=commonMime2Ext[e[1]]||e[1]),c={cmd:"stream_url",url:b.url,size:c,need_send:b.tabId==dy_bkg.popup_sniffer_tabid},d&&(c.desc=d),a&&(c.fext=a),chrome.tabs.sendMessage(b.tabId,c)}}var h=RegExp("^(("+dy_rules.internal_image+")|("+dy_rules.internal_video+")|("+dy_rules.internal_audio+"))$","i"),g=/(^(image|audio|video))|(application\/vnd.rn-realmedia)/i;
return{start:function(){chrome.webRequest.onHeadersReceived.hasListener(f)||chrome.webRequest.onHeadersReceived.addListener(f,{urls:["http://*/*","https://*/*"],types:"main_frame sub_frame stylesheet script image object other".split(" ")},["responseHeaders"])},stop:function(){chrome.webRequest.onHeadersReceived.removeListener(f)}}}var dy_streammonitor=new StreamMonitor;