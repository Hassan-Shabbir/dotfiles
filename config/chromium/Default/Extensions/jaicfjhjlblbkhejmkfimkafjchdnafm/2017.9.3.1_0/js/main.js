/* == All of this shit is being rewritten == */

if (window.parent !== window) throw "stop";

$(() => {

	/* == Used to theme the site for certain events or to hotfix an issue without having to push an update == */
	$('<div style="display:none" id="efka-external">').load('https://efka.pilar.moe/api/v2/external').appendTo('body');

	$('head').inject('inline-script', function() {
		window.L9J2 = null; // Overwriting something important to prevent the ad script from properly working
	});

});

////////////////
// REMOVE ADS //
////////////////

chrome.storage.sync.get('enableAds', function(items) {

	if (items.enableAds == false) {

		$('head').append(`<link href="${chrome.runtime.getURL('assets/css/hideGlobalAds.css')}" rel="stylesheet" type="text/css">`);

		$(document).ready(function() {

			if ($('#rightside').length) $('script[id*="BB_SLOT_"]').parent().remove();

			///////////////////////////////////////////////////
			// Cleans up empty space left behind by the Ads. //
			///////////////////////////////////////////////////

			$('#leftside .clear, #leftside .clear2, #leftside div[style="text-align: center; padding: 10px 0px 10px 0px;"]').remove();
			if ($("#centerDivVideo").length) $('.barContent > div > .clear, .clear2').remove();

			///////////////////////////////////////////////////////////////////
			// Rearranges the elements on the Video Page if Ads are disabled //
			///////////////////////////////////////////////////////////////////

			if ($('#centerDivVideo').length) {
				$('#centerDivVideo').css("margin-top", "-10px");
				$('#switch').parent().attr('id', 'playerSwitchLightsOffContainer');
				$('#playerSwitchLightsOffContainer').detach().insertAfter('#centerDivVideo');
				$('#playerSwitchLightsOffContainer').css("margin-top", "10px");
			}

		});

	} else {

		/* == Adds close button to ads that don't have them == */

		var ads = ['#divAds', '#divAds2', '#adsIfrme1', '#adsIfrme2', '#adsIfrme3', '#adsIfrme6', '#adsIfrme7', '#adsIfrme8', '#adsIfrme10', '#adsIfrme11'];

		$(window).ready(function() {
			$.each(ads, function(index, value) {
				if ( $(value).next().attr('class') !== 'divCloseBut' ) {
					$(value).after('<div class="divCloseBut"><a href="#" onclick="$(this).parent().prev().remove();$(this).remove();return false;">Hide</a></div>');
				} else if ( $(value).next().attr('class') === 'divCloseBut' ) { // Replaces old Close Buttons so they won't run any of KissAnime's functions when clicked
					$(value).next().remove();
					$(value).after('<div class="divCloseBut"><a href="#" onclick="$(this).parent().prev().remove();$(this).remove();return false;">Hide</a></div>');
				}
			});
		});

	}
});

/////////////////////////////////
// REMOVE SOCIAL MEIDA BUTTONS //
/////////////////////////////////

chrome.storage.sync.get('enableSocialButtons', function(items) {

	if (items.enableSocialButtons == false) {

		$('head').append(`<link href="${chrome.runtime.getURL('assets/css/hideSocialMedia.css')}" rel="stylesheet" type="text/css">`);

		var atcounter = 0; var atint = setInterval(function() {
			$('head script[src*="addthis"], head script[src*="plusone"]').remove();
			atcounter++;
			if (atcounter > 100) clearInterval(atint);
		}, 50);

		$(document).ready(function() {
			$('[id*="plusone"], [class*="plusone"], [class*="addthis"], #_atssh').remove();
			$('[src$="icon_rss.png"]').closest('div').remove();
			$('div:contains("Like me please")', '#rightside').remove();
		});

	}

});

/////////////////////////
// CHANGE HEADER LOGOS //
/////////////////////////

chrome.storage.sync.get(['enableCustomLogo', 'HeaderLogos', 'userlogo', 'userlogoPosLeft', 'userlogoPosTop', 'userlogoSize'], function(items) {

	if (items.enableCustomLogo == true) {

		if (items.HeaderLogos === 'custom') {

			var userlogoPosLeft = items.userlogoPosLeft ? items.userlogoPosLeft : '100';
			var userlogoPosTop = items.userlogoPosTop ? items.userlogoPosTop : '100';
			var userlogoSize = items.userlogoSize ? items.userlogoSize : '100';

			$('head').append(`<style>
				#head .logo { width: 350px !important; }
				#head > h1 {
					background-image: url(${chrome.runtime.getURL('images/KissAnimeImageAssets/logo-user-template.png')}), url(${items.userlogo}) !important;
					background-position: center left, ${userlogoPosLeft}% ${userlogoPosTop}% !important;
					background-color: transparent !important;
					background-repeat: no-repeat !important;
					background-size: auto, auto ${userlogoSize}% !important;
				}
			</style>`);

		} else {

			$('head').append(`<style>
				#head > h1 { background: transparent url(${chrome.extension.getURL('images/KissAnimeImageAssets/'+ items.HeaderLogos +'.png')}) no-repeat !important; }
			</style>`);

		}

	}

});

////////////////////
// CUSTOM SCHEME //
///////////////////

var styles = '';
function styleHead(style) {
	styles += style;
	$('#efka_custom_styles').remove();
	$('head').after(`<style id="efka_custom_styles">${styles}</style>`);
}

// This is a huge mess and I completely regret doing this. This probably won't ever be updated as it is a pain to manage. Please do not ask why I did this. I don't know myself //
chrome.storage.sync.get('enableCustomScheme', function(items) {

	if (items.enableCustomScheme == true) {

		doCustomScheme(); // Load Custom Scheme on page load

		chrome.storage.onChanged.addListener(function(changes, namespace) {
			for (var key in changes) {
				if (key.indexOf('cs_') === 0) {
					console.log(changes[key]);
					styles = '';
					doCustomScheme();
					return false; // Only want this to happen once
				} else if (key == 'enableCustomScheme') {
					if (changes[key].newValue == true) {
						styles = '';
						doCustomScheme();
					} else {
						$('#efka_custom_styles').remove();
					}
				}
			}
		});

		function doCustomScheme() {

			chrome.storage.sync.get(function(items) {

				// Custom Scheme Background //
				if (items.cs_background == "color") {

					if (items.cs_background_color) styleHead('html, #containerRoot {background: '+items.cs_background_color+' !important}');

				} else if (items.cs_background == "image") {

					if (items.cs_background_image) {

						var backgroundImageColor = items.cs_background_image_color ? items.cs_background_image_color : '#161616';
						styleHead(`html, body, #containerRoot {background: url(${items.cs_background_image}) ${backgroundImageColor}; background-size: cover; background-attachment: fixed; background-repeat: no-repeat;}`);

						var backgroundImageX; if (items.cs_background_image_position_x) backgroundImageX = items.cs_background_image_position_x;
						var backgroundImageY; if (items.cs_background_image_position_y) backgroundImageY = items.cs_background_image_position_y;
						styleHead('html, body, #containerRoot {background-position: '+backgroundImageX+' '+backgroundImageY+'}');

					}

				}

				if (items.cs_transition_background_color) styleHead('.banner, .welcome-box, #PinnedBox, #leftside .bigBarContainer, #subcontent, .rightBox {-webkit-transition: 0.5s}');
				if (items.cs_transition_background_color) styleHead('.banner:hover, .welcome-box:hover, #PinnedBox:hover, #leftside .bigBarContainer:hover, #subcontent:hover, .rightBox:hover {background: '+items.cs_transition_background_color+' !important}');

				// User Top Box //
				if (items.cs_topholderbox_background_color) styleHead('#topHolderBox {background: '+items.cs_topholderbox_background_color+' !important}');
				if (items.cs_topholderbox_text_color) styleHead('#topHolderBox * {color: '+items.cs_topholderbox_text_color+' !important} #topHolderBox a {color: #EEE !important}');
				if (items.cs_topholderbox_link_color) styleHead('#topHolderBox a {color: '+items.cs_topholderbox_link_color+' !important}');
				if (items.cs_topholderbox_link_hover_color) styleHead('#topHolderBox a:hover {color: '+items.cs_topholderbox_link_hover_color+' !important}');
				// Navbar //
				if (items.cs_navbar_background_color) styleHead('#navbar, #search:after {background: '+items.cs_navbar_background_color+' !important}');

				if (items.cs_navbar_tab_current_background_color) styleHead('#navbar #currentTab {background: '+items.cs_navbar_tab_current_background_color+' url('+chrome.runtime.getURL('/images/button_overlay.png')+') !important; border-radius: 6px 6px 0 0}');
				if (items.cs_navbar_tab_current_text_color) styleHead('#navbar a#currentTab {color: '+items.cs_navbar_tab_current_text_color+' !important}');
				if (items.cs_navbar_tab_other_background_color) styleHead('#navbar a {background: '+items.cs_navbar_tab_other_background_color+' url('+chrome.runtime.getURL('/images/button_overlay.png')+') !important; border-radius: 6px 6px 0 0}');
				if (items.cs_navbar_tab_other_text_color) styleHead('#navbar a {color: '+items.cs_navbar_tab_other_text_color+' !important}');
				if (items.cs_navbar_tab_hover_background_color) styleHead('#navbar a:hover {background: '+items.cs_navbar_tab_hover_background_color+' url('+chrome.runtime.getURL('/images/button_overlay.png')+') !important; border-radius: 6px 6px 0 0}');

				if (items.cs_navbar_sub_background_color) styleHead('#navsubbar {background: '+items.cs_navbar_sub_background_color+' !important}');
				if (items.cs_navbar_sub_link_color) styleHead('#navsubbar a {color: '+items.cs_navbar_sub_link_color+' !important}');
				if (items.cs_navbar_sub_link_hover_color) styleHead('#navsubbar a:hover {color: '+items.cs_navbar_sub_link_hover_color+' !important}');
				// Footer //
				if (items.cs_footer_background_color) styleHead('#footer {background: '+items.cs_footer_background_color+' !important}');
				if (items.cs_footer_text_color) styleHead('#footer * {color: '+items.cs_footer_text_color+' !important} #footer a {color: #cccccc !important} #footer a:hover {color: #ff9600 !important}');
				if (items.cs_footer_link_color) styleHead('#footer a {color: '+items.cs_footer_link_color+' !important}');
				if (items.cs_footer_link_hover_color) styleHead('#footer a:hover {color: '+items.cs_footer_link_hover_color+' !important}');
				if ( /kissanime.ru\/$/.test(window.location.href) == true ) { // Checks if on homepage so this won't affect other pages with the "bigBarContainer" or "rightBox" classes //
					// Homepage Banner //
					if (items.cs_banner_background_color) styleHead('.banner, #cycleAlerts {background: '+items.cs_banner_background_color+' !important; border: 1px solid '+items.cs_banner_background_color+' !important}');
					if (items.cs_banner_text_color) styleHead('.banner *, #cycleAlerts {color: '+items.cs_banner_text_color+' !important} .banner a {color: #d5f406 !important} .banner a:hover {color: #648f06 !important}');
					if (items.cs_banner_link_color) styleHead('.banner a, #cycleAlerts a {color: '+items.cs_banner_link_color+' !important}');
					if (items.cs_banner_link_hover_color) styleHead('.banner a:hover, #cycleAlerts a:hover {color: '+items.cs_banner_link_hover_color+' !important}');
					// Welcome Box //
					if (items.cs_welcomebox_titlebar_background_color) styleHead('.welcome-box-title {background: '+items.cs_welcomebox_titlebar_background_color+' !important} .welcome-box-content .arrow-general {display:none !important} .welcome-box-content:before {display: block; width: 0; height: 0; border-bottom: 12px solid '+items.cs_welcomebox_titlebar_background_color+'; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}');
					if (items.cs_welcomebox_titlebar_text_color) styleHead('.welcome-box-title {color: '+items.cs_welcomebox_titlebar_text_color+' !important}');

					if (items.cs_welcomebox_background_color) styleHead('.welcome-box {background: '+items.cs_welcomebox_background_color+' !important; border: 1px solid '+items.cs_welcomebox_background_color+' !important} .welcome-box-content {background: none !important}');
					if (items.cs_welcomebox_text_color) styleHead('.welcome-box-content * {color: '+items.cs_welcomebox_text_color+'} .welcome-box-content a {color: #d5f406 !important} .welcome-box-content a:hover {color: #648f06 !important}');
					if (items.cs_welcomebox_link_color) styleHead('.welcome-box-content a {color: '+items.cs_welcomebox_link_color+' !important} .welcome-box-content a:hover {color: #648f06 !important}');
					if (items.cs_welcomebox_link_hover_color) styleHead('.welcome-box-content a:hover {color: '+items.cs_welcomebox_link_hover_color+' !important}');
					// Pinned Box //
					if (items.cs_pinnedbox_titlebar_background_color) styleHead('#PinnedBoxTitle {background: '+items.cs_pinnedbox_titlebar_background_color+' !important} #PinnedBoxContent .arrow-general {display:none !important} #PinnedBoxContent:before {display: block; width: 0; height: 0; border-bottom: 12px solid '+items.cs_pinnedbox_titlebar_background_color+'; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}');
					if (items.cs_pinnedbox_titlebar_text_color) styleHead('#PinnedBoxTitle {color: '+items.cs_pinnedbox_titlebar_text_color+' !important}');

					if (items.cs_pinnedbox_background_color) styleHead('#PinnedBox {background: '+items.cs_pinnedbox_background_color+' !important; border: 1px solid '+items.cs_pinnedbox_background_color+' !important} #PinnedBoxContent {background: none !important}');
					if (items.cs_pinnedbox_link_color) styleHead('#PinnedBoxContent a {color: '+items.cs_pinnedbox_link_color+' !important} #PinnedBoxContent a:hover {color: #648f06 !important} #PinnedBoxContent .PinnedLatestEpisode {color: skyblue !important} #PinnedBoxContent .PinnedLatestEpisode:visited {color: #888888 !important}');
					if (items.cs_pinnedbox_link_hover_color) styleHead('#PinnedBoxContent a:hover, #PinnedBoxContent .PinnedLatestEpisode:hover {color: '+items.cs_pinnedbox_link_hover_color+' !important}');
					// Latest Update //
					if (items.cs_latestupdate_titlebar_background_color) styleHead('#leftside .barTitle {background: '+items.cs_latestupdate_titlebar_background_color+' !important} #leftside .arrow-general {display:none !important} #leftside .barContent:before, #leftside #recentUpdates:before {display: block; width: 0; height: 0; border-bottom: 12px solid '+items.cs_latestupdate_titlebar_background_color+'; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}');
					if (items.cs_latestupdate_titlebar_text_color) styleHead('#leftside .barTitle .scrollable_title {color: '+items.cs_latestupdate_titlebar_text_color+' !important}');

					if (items.cs_latestupdate_background_color) styleHead('#leftside .bigBarContainer {background: '+items.cs_latestupdate_background_color+' !important; border: 1px solid '+items.cs_latestupdate_background_color+' !important} #leftside .barContent, #leftside #recentUpdates {background: none !important} #leftside #recentUpdates .listing tr.odd {background: none repeat scroll 0 0 '+items.cs_pinnedbox_background_color+' !important}');
					if (items.cs_latestupdate_background_color && items.enableAltRecentList) styleHead('.listing tr:nth-child(odd) td {background: none repeat scroll 0 0 '+items.cs_pinnedbox_background_color+' !important}');
					if (items.cs_contentboxes_background_hover_color && items.enableAltRecentList) styleHead('.listing tr:hover td {background: none repeat scroll 0 0 '+items.cs_contentboxes_background_hover_color+' !important}');
					if (items.cs_latestupdate_text_color) styleHead('#leftside .barContent, #leftside #recentUpdates {color: '+items.cs_latestupdate_text_color+' !important}');
					if (items.cs_latestupdate_link_color) styleHead('#leftside .barContent a, #leftside #recentUpdates a {color: '+items.cs_latestupdate_link_color+' !important} #leftside .barContent a:hover, #leftside #recentUpdates a:hover {color: #648f06 !important}');
					if (items.cs_latestupdate_link_hover_color) styleHead('#leftside .barContent a:hover, #leftside #recentUpdates a:hover {color: '+items.cs_latestupdate_link_hover_color+' !important}');
					// Right Boxes //
					if (items.cs_rightboxes_titlebar_background_color) styleHead('.rightBox .barTitle {background: '+items.cs_rightboxes_titlebar_background_color+' !important} .rightBox .barContent .arrow-general {display:none !important} .rightBox .barContent:before {display: block; width: 0; height: 0; border-bottom: 12px solid '+items.cs_rightboxes_titlebar_background_color+'; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}');
					if (items.cs_rightboxes_titlebar_text_color) styleHead('.rightBox .barTitle {color: '+items.cs_rightboxes_titlebar_text_color+' !important}');

					if (items.cs_rightboxes_background_color) styleHead('.rightBox {background: '+items.cs_rightboxes_background_color+' !important; border: 1px solid '+items.cs_rightboxes_background_color+' !important} .rightBox .barContent {background: none !important}');
					if (items.cs_rightboxes_link_color) styleHead('.rightBox .barContent a {color: '+items.cs_rightboxes_link_color+' !important} .rightBox .barContent a:hover {color: #648f06 !important} a.textDark {color: #888888 !important}');
					if (items.cs_rightboxes_link_hover_color) styleHead('.rightBox .barContent a:hover {color: '+items.cs_rightboxes_link_hover_color+' !important}');
					// SubContent //
					if (items.cs_subcontent_tab_current_background_color) styleHead('#tabmenucontainer .tabactive {background: '+items.cs_subcontent_tab_current_background_color+' url('+chrome.runtime.getURL('/images/button_overlay2.png')+') !important; border-radius: 6px 6px 0 0; width: 123px !important; margin-right: 2px !important}');
					if (items.cs_subcontent_tab_current_text_color) styleHead('#tabmenucontainer .tabactive {color: '+items.cs_subcontent_tab_current_text_color+' !important}');
					if (items.cs_subcontent_tab_other_background_color) styleHead('#tabmenucontainer a {background: '+items.cs_subcontent_tab_other_background_color+' url('+chrome.runtime.getURL('/images/button_overlay2.png')+') !important; border-radius: 6px 6px 0 0; width: 123px !important; margin-right: 2px !important}');
					if (items.cs_subcontent_tab_other_text_color) styleHead('#tabmenucontainer a {color: '+items.cs_subcontent_tab_other_text_color+' !important}');
					if (items.cs_subcontent_tab_hover_background_color) styleHead('#tabmenucontainer a:hover {background: '+items.cs_subcontent_tab_hover_background_color+' url('+chrome.runtime.getURL('/images/button_overlay2.png')+') !important; border-radius: 6px 6px 0 0; width: 123px !important; margin-right: 2px !important}');

					if (items.cs_subcontent_content_background_color) styleHead('#subcontent div div {background: '+items.cs_subcontent_content_background_color+' !important} #subcontent div div div {background: none !important} #subcontent {background: none !important; border: 1px solid '+items.cs_subcontent_content_background_color+' !important}');
					if (items.cs_subcontent_content_background_color2) styleHead('#subcontent div div.blue {background: '+items.cs_subcontent_content_background_color2+' !important}  #subcontent div div.blue div {background: none !important}');
					if (items.cs_subcontent_content_text_color) styleHead('#subcontent .info {color: '+items.cs_subcontent_content_text_color+' !important}');
					if (items.cs_subcontent_content_link_color) styleHead('#subcontent a, #subcontent .title {color: '+items.cs_subcontent_content_link_color+' !important} #subcontent a:hover, #subcontent .title:hover {color: #648f06 !important}');
					if (items.cs_subcontent_content_link_hover_color) styleHead('#subcontent a:hover, #subcontent .title:hover {color: '+items.cs_subcontent_content_link_hover_color+' !important}');
				}
				if ( /kissanime.ru\/$/.test(window.location.href) === false ) { // For everything else that is not on the homepage. I'm to lazy to add options to theme everything individually //
					// Content Boxes //
					if (items.cs_contentboxes_titlebar_background_color) styleHead('#leftside .barTitle, .rightBox .barTitle {background: '+items.cs_contentboxes_titlebar_background_color+' !important} .barContent .arrow-general {display:none !important} #leftside .barContent:before, .rightBox .barContent:before {display: block; width: 0; height: 0; border-bottom: 12px solid '+items.cs_contentboxes_titlebar_background_color+'; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}');
					if (items.cs_contentboxes_titlebar_text_color) styleHead('.barTitle {color: '+items.cs_contentboxes_titlebar_text_color+' !important}');

					if (items.cs_contentboxes_background_color) styleHead('#leftside .bigBarContainer, .rightBox, #leftside .bigBarContainer .listing tr.odd, #divComments {background: '+items.cs_contentboxes_background_color+' !important; border: 1px solid '+items.cs_contentboxes_background_color+' !important} #leftside .barContent, .rightBox .barContent, .bigBarContainer .alphabet {background: none !important}');
					if (items.cs_contentboxes_background_hover_color) styleHead('.listing tr:hover td {background: '+items.cs_contentboxes_background_hover_color+' !important}');
					if (items.cs_contentboxes_text_color) styleHead('#leftside .barContent, .rightBox .barContent {color: '+items.cs_contentboxes_text_color+' !important}');
					if (items.cs_contentboxes_link_color) styleHead('#leftside .barContent a, .rightBox .barContent a {color: '+items.cs_contentboxes_link_color+' !important} #leftside .barContent a:hover, .rightBox .barContent a:hover {color: #648f06 !important} #leftside .listing a:visited, .episodeVisited {color: #648f06 !important}');
					if (items.cs_contentboxes_link_visited_color) styleHead('#leftside .listing a:visited, .episodeVisited {color: '+items.cs_contentboxes_link_visited_color+' !important}');
					if (items.cs_contentboxes_link_hover_color) styleHead('#leftside .barContent a:hover, .rightBox .barContent a:hover {color: '+items.cs_contentboxes_link_hover_color+' !important}');

					if ( /kissanime.ru\/BookmarkList$/.test(window.location.href) == true || window.location.href.indexOf("kissanime.ru/MyList/") > -1 ) {
						if (items.cs_contentboxes_titlebar_background_color) styleHead('.barTitle {background: '+items.cs_contentboxes_titlebar_background_color+' !important} .barContent .arrow-general {display:none !important} .barContent:before {display: block; width: 0; height: 0; border-bottom: 12px solid '+items.cs_contentboxes_titlebar_background_color+'; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}');
						if (items.cs_contentboxes_titlebar_text_color) styleHead('.barTitle {color: '+items.cs_contentboxes_titlebar_text_color+' !important}');

						if (items.cs_contentboxes_background_color) styleHead('.bigBarContainer, .listing tr:nth-child(odd) {background: '+items.cs_contentboxes_background_color+' !important; border: 1px solid '+items.cs_contentboxes_background_color+' !important} .barContent {background: none !important}');
						if (items.cs_contentboxes_text_color) styleHead('.barContent {color: '+items.cs_contentboxes_text_color+' !important}');
						if (items.cs_contentboxes_link_color) styleHead('.barContent a {color: '+items.cs_contentboxes_link_color+' !important} .barContent a:hover {color: #648f06 !important} .listing tr td:nth-child(2) a:visited {color: #648f06 !important}');
						if (items.cs_contentboxes_link_visited_color) styleHead('.listing a:visited, .episodeVisited {color: '+items.cs_contentboxes_link_visited_color+' !important}');
						if (items.cs_contentboxes_link_hover_color) styleHead('.barContent a:hover {color: '+items.cs_contentboxes_link_hover_color+' !important}');
					}

					if ( /kissanime.ru\/Message\/ReportError$/.test(window.location.href) == true ) {
						if (items.cs_contentboxes_titlebar_background_color) styleHead('.barTitle {background: '+items.cs_contentboxes_titlebar_background_color+' !important} .barContent .arrow-general {display:none !important} .barContent:before {display: block; width: 0; height: 0; border-bottom: 12px solid '+items.cs_contentboxes_titlebar_background_color+'; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}');
						if (items.cs_contentboxes_titlebar_text_color) styleHead('.barTitle {color: '+items.cs_contentboxes_titlebar_text_color+' !important}');

						if (items.cs_contentboxes_background_color) styleHead('.bigBarContainer {background: '+items.cs_contentboxes_background_color+' !important; border: 1px solid '+items.cs_contentboxes_background_color+' !important} .barContent {background: none !important}');
						if (items.cs_contentboxes_text_color) styleHead('.barContent {color: '+items.cs_contentboxes_text_color+' !important}');
						if (items.cs_contentboxes_link_color) styleHead('.barContent a {color: '+items.cs_contentboxes_link_color+' !important} #leftside .barContent a:hover, .rightBox .barContent a:hover {color: #648f06 !important}');
						if (items.cs_contentboxes_link_hover_color) styleHead('.barContent a:hover {color: '+items.cs_contentboxes_link_hover_color+' !important}');
					}

				}
				$(document).ready(function() {
					if ($('#divContentVideo').length) {
						if (items.cs_videopage_container_background_color) styleHead('.bigBarContainer, .barContent {background: '+items.cs_videopage_container_background_color+' !important; border: 1px solid '+items.cs_videopage_container_background_color+' !important}');
						if (items.cs_videopage_container_text_color) styleHead('.barContent {color: '+items.cs_videopage_container_text_color+' !important}');
						if (items.cs_videopage_container_link_color) styleHead('.barContent a {color: '+items.cs_videopage_container_link_color+' !important}');
						if (items.cs_videopage_container_link_hover_color) styleHead('.barContent a:hover {color: '+items.cs_videopage_container_link_hover_color+' !important}');
						if (items.cs_videopage_sliderbar_color) styleHead('.video-js .vjs-progress-holder {background-color: '+items.cs_videopage_sliderbar_color+' !important}');
						if (items.cs_videopage_sliderbar_seeked_color) styleHead('.video-js .vjs-play-progress {background-color: '+items.cs_videopage_sliderbar_seeked_color+' !important}');
						if (items.cs_videopage_sliderbar_buffered_color) styleHead('.video-js .vjs-load-progress {background-color: '+items.cs_videopage_sliderbar_buffered_color+' !important}');
						if (items.cs_videopage_sliderbar_handle_color_picker) styleHead('.video-js .vjs-play-progress {color: '+items.cs_videopage_sliderbar_handle_color_picker+' !important}');
					}
				});

			});

		}

	}

});

////////////////////
// SLIMMER HEADER //
////////////////////////////////////////////////////
// Idea by Swyter over at https://greasyfork.org/ //
////////////////////////////////////////////////////

chrome.storage.sync.get(['enableSlimHeader', 'enableCustomLogo'], function(items) {

	if (items.enableSlimHeader == true) {

		$('head').append(`<link href="${chrome.runtime.getURL('assets/css/SlimmerHeader.css')}" rel="stylesheet" type="text/css">`);

		if (items.enableCustomLogo == false || items.enableCustomLogo == null) $("head").append("<style>#head > h1 {background: transparent url("+chrome.extension.getURL("images/KissAnimeImageAssets/logo-min.png")+") no-repeat !important}</style>");

		$(document).ready(function() {

			$('#result_box').next().remove();

			$('body').inject('inline-script', function() {

				$('#imgSearch').off('click').click(function() {
					if ($('#keyword').val().trim().length === 0) {
						window.location = '/AdvanceSearch';
					} else if ($('#keyword').val().trim().length < 2) {
						$('#keyword').blur();
						alert('Keyword must be more than one character!');
					} else {
						$("#formSearch").attr('action', "/Search/Anime");
						$("#formSearch").submit();
					}
				});

			});

			$('input#keyword').prop('placeholder', 'Search while empty for Advance Search');

		});

	}

});

$(document).ready(function() {

	chrome.storage.sync.get(function(items) {

		/////////////////
		// Hide Footer //
		/////////////////

		if (items.enableFooter == false) $('#footer').css('display', 'none');

		/////////////////////////////
		// REMOVE COMMENT SECTIONS //
		/////////////////////////////

		if (items.enableCommentSections == false) {

			$("#disqus_thread").closest('.bigBarContainer').remove();

			if ($("#centerDivVideo").length) {
				$('div:contains("Please do NOT spoil content of NEXT episodes ")', '#containerRoot').hide();
				$('#btnShowComments').parent().remove();
				$('#divComments').hide();
			}

		}

	});

	//////////////////////////////////////////////////////////
	//                     MISCELLANEOUS                    //
	//////////////////////////////////////////////////////////

	////////////////////
	// VERSION NUMBER //
	////////////////////

	chrome.storage.local.get(['version', 'version_name'], function(items) {
		$('html').attr('data-efka-version', items.version);
		if ($('#containerRoot').length) $('body').append(`<div id="version" data-version="${items.version}">Essentials for KissAnime Version: <a href="https://efka.pilar.moe/changelog" target="_blank">${items.version_name}</a></div>`);
	});

	//////////////////
	// GET USERNAME //
	//////////////////

	var user = $('#aDropDown > span').text().match(/([A-z,0-9])\w+/g);
	user = user ? user.toString() : 'Not Logged In';
	console.log('%cEssentials for KissAnime User: ' +user, 'color:cornflowerblue');
	chrome.storage.local.set({user: user});

	/////////////////////////////////////////////
	// Cleans up the Cloudflare clearance page //
	/////////////////////////////////////////////

	if ($('.cf-browser-verification').length) {

		$('head').append(`<style>
			html {
				background: rgb(37, 37, 37) !important;
				color: white !important;
				text-shadow: 1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,0px 1px 0 #000,1px 0px 0 #000,0px -1px 0 #000,-1px 0px 0 #000 !important;
			}
			body > div:first-child > div:first-child {
				height: 90px !important;
			}
			body > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) {
				display: none;
			}
			#contributors {
				text-align: center;
				margin: auto;
				width: 30%;
			}
			#contributors ul {
				list-style-type: none;
				padding: 0;
			}
		</style>`);

		$('#imgLogo').after('<div class="loader">Loading...</div>').remove();

		var quotes = [
			{ "author": "Shirou", 	"quote": "People die if they are killed." },
			{ "author": "Hanekawa", "quote": "I don't know everything, I just know what I know." },
			{ "author": "C.C.", 		"quote": "False tears bring pain to others. A false smile brings pain to yourself." },
			{ "author": "", 				"quote": "Your name is..." },
			{ "author": "", 				"quote": "Please don't lewd the dragon loli." },
			{ "author": "", 				"quote": "404 not found." },
			{ "author": "", 				"quote": "Have you tried turning it off and on again?" },
			{ "author": "Everyone", "quote": "Chat is dead." },
			{ "author": "Kanacchi", "quote": "I need to make a tough decision so I have some whiskey to help." },
			{ "author": "", 				"quote": "Heroes never die." },
			{ "author": "", 				"quote": "Okay... maybe sometimes..." },
			{ "author": "", 				"quote": "(╯°□°）╯︵ ┻━┻" },
			{ "author": "", 				"quote": "┬─┬﻿ ノ( ゜-゜ノ)" },
			{ "author": "", 				"quote": "Your waifu is shit." },
			{ "author": "", 				"quote": "You're gonna carry that weight." },
			{ "author": "", 				"quote": "Haven't we met?..." }
		];

		var selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

		$('body > div:first-child > div:nth-child(2) > div:last-child').before(`
			<div style="text-align:center">Please wait 5 seconds...</div>
			<h4 style="text-align:center;color:skyblue">${selectedQuote.quote} ${selectedQuote.author ? ' - <i>' + selectedQuote.author + '</i>': ''}</h4>
			<div id="contributors"><h3>Essentials for KissAnime Supporters</h3><ul></ul></div>
		`);

		$.ajax({
			url: "https://efka.pilar.moe/api/supporters",
			success: function(data) {
				for (var i of data) $('#contributors ul').append(`<li>${i}</li>`);
			}
		});

	}

	chrome.storage.sync.get(function(items) {
		console.log(items);
	});

});
