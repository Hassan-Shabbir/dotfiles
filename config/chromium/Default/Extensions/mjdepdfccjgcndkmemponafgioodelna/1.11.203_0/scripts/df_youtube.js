var links = {
		nodes: [],
		hrefs: []
	},
	options;

chrome.runtime.sendMessage({query: 'get options'}, function(response) {
	options = response.options;
	console.log(options);
	initiate();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.query === 'update view')
	{
		options = request.options;
		initiate();
	}

	else if (request.query === 'page updated')
	{
		options = request.options;
		initiate(true);
	}
});

function initiate(pageUpdated)
{
	pageUpdated = typeof pageUpdated === 'undefined' ? false : pageUpdated;

	var timeInterval = 250;

	setTimeout(function() {
		if (options.hideFeed)
			add_css('hide_browse.css');

		if (options.visibility.hideFeed) {
			if (document.URL === 'https://www.youtube.com/') {
				console.log('yep');
				set_hide_feed(true, true);
			}
		}
		
		var progress = document.querySelector('yt-page-navigation-progress #progress');
		var test1 = (document.readyState === 'complete' && // old youtube
				document.body.className.search('page-loaded') > -1 &&
				progress === null);
		var test2 = (document.readyState === 'complete' && // new youtube
				progress !== null && 
				(progress.style.transform === 'scaleX(1)' || 
					progress.style.transform === ''));
	if (test1) {
			remove_css('hide_browse');
			df_youtube(pageUpdated);
		} else if (test2) {
			remove_css('hide_browse');
			df_youtube(pageUpdated);
		} else {
			initiate();
		}
	}, timeInterval);
}

function df_youtube(pageUpdated)
{
	if (options.active)
	{
		// remove viddeo ads
		var ads = document.querySelectorAll('#video-masthead');
		for (var i=0; i<ads.length; i++)
		{
			ads[i].parentElement.removeChild(ads[i]);
		}
		add_css('df_youtube_common.css');
		add_css('df_youtube.css');
		set_hide_feed(
			options.visibility.hideFeed,
			document.URL === 'https://www.youtube.com/' && options.visibility.hideRecommended);
		set_hide_sidebar(options.visibility.hideSidebar, options.visibility.hidePlaylist);
		set_hide_subbar(options.visibility.hideSubBar);
		set_hide_comments(options.visibility.hideComments);
		set_hide_related(options.visibility.hideRelated);
		set_hide_trending(options.visibility.hideTrending);
	}
	else
	{
		remove_css('df_youtube_common.css');
		remove_css('df_youtube.css');
		remove_css('df_youtube.css');
		set_hide_feed(false, false);
		set_hide_sidebar(false, false);
		set_hide_subbar(false);
		set_hide_comments(false);
		set_hide_related(false);
		set_hide_trending(false);
	}

	// PLAYLISTS
	if (options.disablePlaylists && options.active)
	{
		setTimeout(function() {
			if (links.nodes.length === 0 || pageUpdated)
			{
				links.nodes = document.querySelectorAll('a');
				links.hrefs = [];
				links.hrefs[links.nodes.length - 1] = '';

				for (var i = 0; i < links.nodes.length; i++)
				{
					links.hrefs[i] = links.nodes[i].href;
					if (links.hrefs[i] !== "") {
						links.nodes[i].href = strip_playlist(links.nodes[i].href);
					}
				}
			}
		}, 1500);
	}
	else
	{
		if (links.nodes.length > 0)
		{
			for (var i = 0; i < links.nodes.length; i++)
			{
				if (links.hrefs[i] !== "")
					links.nodes[i].href = links.hrefs[i];
			}

			links = {
				nodes: [],
				hrefs: []
			};
		}
	}
}

function set_hide_trending(hide)
{
	if (hide)
	{
		add_css('trending.css');
	}
	else
	{
		remove_css('trending.css');
	}
}

function set_hide_feed(hideFeed, hideRecommended)
{
	//HIDE IN DF_YOUTUBE_COMMON.CSS TO PREVENT FLASHING
	if (hideFeed)
	{
		remove_css('show_feed.css');
		add_css('hide_feed.css');
		// feed.style.setProperty('display', 'none', 'important');
	}
	
	else
	{
		remove_css('hide_feed.css');
		add_css('show_feed.css');

		if (hideRecommended)
		{
			add_css('hide_recommended.css');
		}
		else
		{
			remove_css('hide_recommended.css');
		}
		// feed.style.setProperty('display', 'block', 'important');
	}
}

function set_hide_sidebar(hide, hidePlaylist)
{
	if (hide)
	{
		add_css('hide_sidebar_contents.css');
	}
	else
	{
		remove_css('hide_sidebar_contents.css');
	}

	if (hide && (hidePlaylist || document.URL.search('list=') === -1)) //document.URL.search('watch\\?v=') > 0 && 
	{
		add_css('expand_content.css');
	}
	else
	{
		remove_css('expand_content.css');
	}
}

function set_hide_subbar(hide)
{
	if (hide)
	{
		add_css('hide_subbar.css');
	}
	else
	{
		remove_css('hide_subbar.css');
	}
}

function set_hide_comments(hide)
{
	if (hide)
	{
		add_css('hide_comments.css');
	}
	else
	{
		remove_css('hide_comments.css');
	}
}

function set_hide_related(hide)
{
	if (hide)
	{
		add_css('hide_related_videos.css');
	}
	else
	{
		remove_css('hide_related_videos.css');
	}
}

function add_css(file)
{
	var checkLink = document.querySelector('link[href="' + chrome.extension.getURL("css/" + file) + '"]'),
		link;
	
	if (checkLink === null)
	{
		link = document.createElement("link");
		link.href = chrome.extension.getURL("css/" + file);
		link.type = "text/css";
		link.rel = "stylesheet";
		link.media = "screen,print";
		document.getElementsByTagName("head")[0].appendChild(link);
	}

}

function remove_css(file)
{
	var link = document.querySelectorAll('link[href="' + chrome.extension.getURL("css/" + file) + '"]');

	if (link.length > 0)
	{
		for (var i = 0; i < link.length; i++)
		{
			link[i].parentNode.removeChild(link[i]);
		}
	}
}

function disable_playlists()
{
	var links = document.querySelectorAll('a');
	
	setTimeout(function() {
		console.log('hello');
		for (var i = 0; i < links.length; i++)
		{
			links[i].href = strip_playlist(links[i].href);
		}
	}, 2500);
}

function strip_playlist(href)
{
	listPos = href.search('&list=');

	if (listPos >= 0 && href.search('watch\\?v=') >= 0)
	{
		href = href.slice(0, listPos);
	}

	return href;
}

function fire_event(node, eventName) {
	// Make sure we use the ownerDocument from the provided node to avoid cross-window problems
	var doc;
	if (node.ownerDocument) {
		doc = node.ownerDocument;
	} else if (node.nodeType == 9){
		// the node may be the document itself, nodeType 9 = DOCUMENT_NODE
		doc = node;
	} else {
		throw new Error("Invalid node passed to fireEvent: " + node.id);
	}

	 if (node.dispatchEvent) {
		// Gecko-style approach (now the standard) takes more work
		var eventClass = "";

		// Different events have different event classes.
		// If this switch statement can't map an eventName to an eventClass,
		// the event firing is going to fail.
		switch (eventName) {
			case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
			case "mousedown":
			case "mouseup":
				eventClass = "MouseEvents";
				break;

			case "focus":
			case "change":
			case "blur":
			case "select":
				eventClass = "HTMLEvents";
				break;

			default:
				throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
				break;
		}
		var event = doc.createEvent(eventClass);

		var bubbles = eventName == "change" ? false : true;
		event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

		event.synthetic = true; // allow detection of synthetic events
		// The second parameter says go ahead with the default action
		node.dispatchEvent(event, true);
	} else  if (node.fireEvent) {
		// IE-old school style
		var event = doc.createEventObject();
		event.synthetic = true; // allow detection of synthetic events
		node.fireEvent("on" + eventName, event);
	}
};