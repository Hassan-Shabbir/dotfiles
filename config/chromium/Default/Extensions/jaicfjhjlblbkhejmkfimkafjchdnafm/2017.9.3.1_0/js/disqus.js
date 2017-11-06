chrome.storage.sync.get(function(items) {

	if (items.enableAds === false || items.enableVideoPageAds === false) $('head').append('<style>.post.advertisement {display:none}</style>');

});
