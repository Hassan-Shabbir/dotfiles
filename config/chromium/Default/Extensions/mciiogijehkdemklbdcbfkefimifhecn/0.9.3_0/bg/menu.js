function MenuMan(){function c(a,b,c,d){void 0==f[a]&&(f[a]=chrome.contextMenus.create({title:b,contexts:c,onclick:d,documentUrlPatterns:["http://*/*","https://*/*","ftp://*/*"]}))}function e(a){var b=f[a];void 0!=b&&(chrome.contextMenus.remove(b),delete f[a])}function k(a,b,c){var d={cmd:"d_one",task:{}};d.task.referer=b;d.task.url=a;if(a=dy_urlmonitor.getDesc(a))d.task.text=a.text,d.task.title=a.title,d.task.desc=a.download||a.text||a.title;chrome.tabs.sendMessage(c.id,d,function(a){a||(console.log("menu download no response"),
dy_tabman.open_ui({activate:!0},function(){chrome.runtime.sendMessage(d)}))})}function l(a,b,c){var d={};d.url=a;d.referer=b;var e=dy_settings.get_taskdef();d.naming=e.naming;d.folder=e.folder;d.threads=e.threads;b=dy_settings.get("def_addpause");e=e.addtop;chrome.tabs.sendMessage(c.id,{cmd:"d_anim",addpause:b});c="";if(a=dy_urlmonitor.getDesc(a))d.text=a.text,d.title=a.title,d.desc=a.download||d.text||d.title,c=a.page_title;chrome.runtime.sendMessage({cmd:"new_task",add_paused:b,addtop:e,tasks:[d],
notify:!0,page_title:c})}function m(a,b){dy_tabman.open_ui()}function n(a,b){dy_tabman.open_options({uiWinId:b.windowId,pos:b.index+1,section:"help"})}function p(a,b){chrome.tabs.create({active:!0,url:"http://faq.chronodownloader.net"})}function q(a,b){chrome.tabs.create({active:!0,url:"http://bugs.chronodownloader.net"})}function r(a,b){a.linkUrl&&k(a.linkUrl,a.pageUrl||a.frameUrl,b)}function g(a,b){a.srcUrl&&k(a.srcUrl,a.pageUrl||a.frameUrl,b)}function s(a,b){a.linkUrl&&l(a.linkUrl,a.pageUrl||a.frameUrl,
b)}function h(a,b){a.srcUrl&&l(a.srcUrl,a.pageUrl||a.frameUrl,b)}var f={};return{toggleDialog:function(a){a?(c("d_link",chrome.i18n.getMessage("menuDLink"),["link"],r),c("d_image",chrome.i18n.getMessage("menuDImage"),["image"],g),c("d_video",chrome.i18n.getMessage("menuDVideo"),["video"],g),c("d_audio",chrome.i18n.getMessage("menuDAudio"),["audio"],g)):(e("d_link"),e("d_image"),e("d_video"),e("d_audio"))},toggleOneclick:function(a){a?(c("d_link_oneclick",chrome.i18n.getMessage("menuDLinkOneClick"),
["link"],s),c("d_image_oneclick",chrome.i18n.getMessage("menuDImageOneClick"),["image"],h),c("d_video_oneclick",chrome.i18n.getMessage("menuDVideoOneClick"),["video"],h),c("d_audio_oneclick",chrome.i18n.getMessage("menuDAudioOneClick"),["audio"],h)):(e("d_link_oneclick"),e("d_image_oneclick"),e("d_video_oneclick"),e("d_audio_oneclick"))},addBA:function(){c("ba_openmanager",chrome.i18n.getMessage("menuOpenManager"),["browser_action"],m);c("ba_help",chrome.i18n.getMessage("menuGetHelp"),["browser_action"],
n);c("ba_faq",chrome.i18n.getMessage("btnFAQ"),["browser_action"],p);c("ba_report",chrome.i18n.getMessage("menuReportIssue"),["browser_action"],q);"zh-CN"!=chrome.i18n.getUILanguage()&&c("ba_translate","Help us with translation",["browser_action"],function(a,b){chrome.tabs.create({active:!0,url:"http://translate.chronodownloader.net"})})}}}var dy_menuman=new MenuMan;