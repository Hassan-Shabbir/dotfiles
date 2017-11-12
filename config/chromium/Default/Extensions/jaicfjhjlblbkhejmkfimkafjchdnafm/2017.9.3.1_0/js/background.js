// Checks to see if extension updated or installed for the first time //

chrome.runtime.onInstalled.addListener(function(details) {

	if (details.reason == "install") {

		// Sets Default on Install //
		chrome.storage.sync.get(function(items) {
			if ($.isEmptyObject(items)) setDefault();
		});

		chrome.tabs.create({url: "options.html"});
		console.log('First Install');

	} else if (details.reason == "update") {

		notifications.create('basic', `Updated to ${chrome.runtime.getManifest().version_name}`, 'Click here to see what has changed.', false, chrome.runtime.getURL('/changelog.html#current'));

		chrome.storage.sync.get(['PinnedList', 'PinnedListURLs', 'PinnedListLW', 'PinnedListImg'], function(items) {

			// items.PinnedListImg = [];

			if (items.PinnedListImg) {
				if (items.PinnedList.length !== items.PinnedListImg.length) {
					console.log('PinnedListImg array is out of sync! Clearing PinnedListImg Array.');
					var ImgArray = [];
					console.log(items.PinnedList);
					items.PinnedList.forEach(function() {
						ImgArray.push(null);
					});
					chrome.storage.sync.set({PinnedListImg: ImgArray});
					chrome.storage.sync.remove('PinnedListTimeUpdate');
				}
			}

			if (items.PinnedListLW) {
				if (items.PinnedList.length !== items.PinnedListLW.length) {
					console.log('PinnedListLW array is out of sync! Clearing PinnedListLW Array.');
					var LWArray = [];
					$.each(items.PinnedList, function() {
						LWArray.push('null');
					});
					chrome.storage.sync.set({PinnedListLW: LWArray});
				}
			}

			/* var newStorageFormat = {
				'Titles': items.PinnedList,
				'URLs': items.PinnedListURLs,
				'Imgs': items.PinnedListImg,
				'LW': items.PinnedListImg
			} */

		});

		/*
			I will probably change the way the Pinned List Items are stored. As of right now everything is stored in 4 arrays:
			- PinnedList
			- PinnedListURLs
			- PinnedListImg
			- PinnedListLW
			I plan on storing them in 1 object with 4 arrays inside.
			Example:
				PinnedList = {
					'Titles': ['AnimeTitle1', 'AnimeTitle2', 'AnimeTitle3'],
					'URLs': ['AnimeURL1', 'AnimeURL2', 'AnimeURL3'],
					'Imgs': ['AnimeImg1', 'AnimeImg2', 'AnimeeImg3'],
					'LW': ['AnimeLW1', 'AnimeLW2', 'AnimeLW3']
				}
			Files that will have to be modified for this new format: homepage.js, animeinfo.js, popup.js, options.js, info.js, videopage.js
		*/

		chrome.storage.local.set({previousVersion: details.previousVersion});
		chrome.storage.local.set({recentlyupdated: true});
		chrome.storage.sync.remove('airinglist_state');

		console.log('Updated');

	}

});

function setDefault() {

	chrome.storage.local.set({firstinstall: true});

	chrome.storage.sync.set({
		// Global //
		enableAds: true,
		enableSocialButtons: true,
		enableCommentSections: true,
		enableCustomLogo: false,
		enableSlimHeader: false,
		enableNotifyUpdates: false,
		enableCustomScheme: false,
		enableFooter: true,

		// Home Page //
		enableWelcomeBox: true,
		enablePinnedBox: true,
		enableAltPinnedBox: false,
		enableBanner: true,
		enableAltRecentList: false,
		enableShowOnlyAiring: false,
		enablePinnedTooltips: true,
		enableLatestEpisode: true,
		enableLastVideo: true,

		// Anime Page //
		enableFindinMAL: true,
		enableFindinKitsu: true,
		enableFindRedditDiscussions: true,
		enableDownloadAllLinks: false,

		// Bookmarks Page //
		relocateAiringBookmarks: false,

		// Video Page //
		enableVideoPageAds: true,
		enablePlayerSwitchers: true,
		enableLightsOff: true,
		enableDownloadLinks: true,
		enableFileName: true,
		enableBookmarkLink: true,
		enableAutoAdvEp: false,
		enableKeyboardShortcuts: false,
		enablePlaybackRate: false,
		enableAutoFullscreen: false,
		enableAutoHD: false,
		enableAutoLQ: false,
		enableAltVideoPage: false,
		enablePauseOnSwitch: false,
		enableStretchFullscreenVid: false,
		enableHTML5Fix: false,
		enableTheaterMode: false
	});

}

// Retrieves the Extension's Version Number and saves in local storage //

var version = chrome.runtime.getManifest().version;
var version_name = chrome.runtime.getManifest().version_name;
chrome.storage.local.set({
	version: version,
	version_name: version_name
});

function openOptionsPage() {
	chrome.runtime.openOptionsPage();
}

/* == Redirects to the last used server the user used == */
var lastServer = '' // Default

chrome.storage.sync.get('lastServer', function(items) {
	if (items.lastServer) lastServer = items.lastServer;
})

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		if (key === "lastServer") lastServer = changes[key].newValue;
	}
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {

	var isEpisode = details.url.match(/\/Anime\/.+\/.+\?id=\d+/g) ? true : false;
	var isCaptcha = details.url.match(/\/Special\/AreYouHuman2\?reUrl=.+/ig) ? true : false;
	var serverExist = details.url.match(/&s=\w+/g) ? true : false;

	//if (isEpisode && lastServer && !isCaptcha && !serverExist) return { redirectUrl: details.url.replace(/&s=\w+/g, '') + '&s=' + lastServer }
	//if (isCaptcha) return { redirectUrl: details.url.replace(/&s=\w+/g, '') }

}, {urls: ["*://*.kissanime.ru/*"], types: ["main_frame"]}, ["blocking"]);


/* == Redirects the video.js and video-js.css to the updated one packaged with this extension == */
chrome.webRequest.onBeforeRequest.addListener(function(details) {

	// Redirect //
	if( details.url.indexOf("/Scripts/video-js/video.js") > -1 ) return { redirectUrl: chrome.runtime.getURL('js/videojs/video.js') };
	if( details.url.indexOf("/Scripts/videojs.hotkeys.min.js") > -1 ) return { redirectUrl: chrome.runtime.getURL('js/videojs/videojs.hotkeys.js') };
	if( details.url.indexOf("/Scripts/video-js/video-js.css") > -1 ) return { redirectUrl: chrome.runtime.getURL('js/videojs/video-js.css') };

	// Cancel //
	if( details.url.indexOf("/Scripts/videojs.progressTips.min.js") > -1 ) return {cancel: true};

}, {urls: ["*://*.kissanime.ru/Scripts/*"], types: ["script", "stylesheet"]}, ["blocking"]);

////////////////////////////////////////////////////////////////////////////////////////
// Keep track of active tabs so we can block the ads only if the user is on KissAnime //
////////////////////////////////////////////////////////////////////////////////////////

var activeTabs = new Map();

chrome.tabs.query({active: true}, function(tabs) {
	if (tabs) {
		tabs.forEach(function(value, index) {
			activeTabs.set(value.id, value);
		});
	}
});

chrome.tabs.onUpdated.addListener(function(id, info, tab) {
	activeTabs.set(id, tab);
});

chrome.tabs.onRemoved.addListener(function(id, info) {
	activeTabs.delete(id);
});

///////////////////////////////////////////////////
// Blocks Ads that comes from KissAnime's Domain //
///////////////////////////////////////////////////

var adBlocker = {
	callback: {
		block: function(details) {
			if (activeTabs.has(details.tabId)) {
				var tabURL = $('<a>').attr('href', activeTabs.get(details.tabId).url)[0];
				if (tabURL.hostname === 'kissanime.ru') {
					console.debug('Blocked:', details.url)
					return {cancel: true};
				}
			}
		},
		redirect: function(details) {
			if (activeTabs.has(details.tabId)) {
				var tabURL = $('<a>').attr('href', activeTabs.get(details.tabId).url)[0];
				if (tabURL.hostname === 'kissanime.ru') {
					console.debug('Redirected:', details.url)
					return {redirectUrl: 'data:application/javascript;base64,KGZ1bmN0aW9uKCkgewoJOwp9KSgpOw=='};
				}
			}
		}
	},
	start: function() {
		chrome.webRequest.onBeforeRequest.addListener(adBlocker.callback.block, {urls: filters.cancel}, ["blocking"]);
		chrome.webRequest.onBeforeRequest.addListener(adBlocker.callback.redirect, {urls: filters.redirect}, ["blocking"]);
		console.log('Ad blocker enabled');
	},
	stop: function() {
		chrome.webRequest.onBeforeRequest.removeListener(adBlocker.callback.block);
		chrome.webRequest.onBeforeRequest.removeListener(adBlocker.callback.redirect);
		console.log('Ad blocker disabled');
	},
	restart: function() {
		this.stop();
		this.start();
	}
}

/* == Fuck everything. I'm doing it this way so everyone shutup == */

var filters = {
	redirect: [
		"*://*.onclkds.com/*",
		"*://*.vrewpywootyu.com/*"
	],
	cancel: [
		"*://*.kissanime.ru/ads/*",
		"*://*.kissanime.ru/xyz/check.aspx",
		"*://*.bebi.com/*",
		"*://*.2mdnsys.com/*",
		"*://*.scorecardresearch.com/*",
		"*://*.taboola.com/*",
		"*://*.onclasrv.com/*",
		"*://*.popads.net/*",
		"*://*.td583.com/*",
		"*://*.ti553.com/*",
		"*://*.9icmzvn6.website/*",
		"*://*.mwtpludn.review/*",
		"*://*.66cpwgln.space/*",
		"*://*.1j7740kd.website/*",
		"*://*.153105c2f9564.com/*"
	]
};

chrome.storage.sync.get('enableAds', items => {
	if (items.enableAds === false) {
		updateFilters().then(() => {
			adBlocker.start();
			toggleInterval(true);
		});
	}
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		if (key == "enableAds") {
			if (changes[key].newValue === true) {
				adBlocker.stop();
				toggleInterval(false);
			} else {
				updateFilters().then(() => {
					adBlocker.start();
					toggleInterval(true);
				});
			}
		}
	}
});

var updateInterval;

function toggleInterval(toggle) {
	if (toggle === true) {
		updateInterval = setInterval(() => {
			updateFilters().then(() => {
				adBlocker.restart();
			});
		}, 60 * (60 * 1000));
	} else {
		clearInterval(updateInterval);
	}
}

function updateFilters() {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: "https://efka.pilar.moe/api/v2/filters",
			timeout: 10000,
			success: function(data) {
				filters = data;
				chrome.storage.local.set({filters: filters}, () => {
					console.log('Updated Filters')
					resolve();
				});
			},
			error: function(error) {
				console.log('Error Updating Filters');
				chrome.storage.local.get('filters', items => {
					filters = items.filters;
					resolve();
				})
			}
		});
	});
}

function manualFiltersUpdate() {
	chrome.storage.sync.get('enableAds', items => {
		if (items.enableAds === false) {
			updateFilters().then(() => {
				adBlocker.restart();
			});
		}
	});
}

/* == The code below is used to make sure the Origin header is set on request to my API == */
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	if (activeTabs.has(details.tabId)) {
		var tabURL = $('<a>').attr('href', activeTabs.get(details.tabId).url)[0];
		if (tabURL.hostname === 'kissanime.ru') {
			details.requestHeaders.push({
				"name": 'Origin',
				"value": `chrome-extension://${chrome.runtime.id}`
			});
			return {requestHeaders: details.requestHeaders};
		}
	}
}, {
	urls: ['https://efka.pilar.moe/api/*'],
	types: ["xmlhttprequest"]
}, ["blocking", "requestHeaders"]);

///////////////////
// Notifications //
///////////////////

var notifications = {
	"active": new Map(),
	"create": function(type, text, altText, sticky, url) {
		var notificationContent = {
			type: type,
			title: 'Essentials for KissAnime',
			message: text,
			iconUrl: 'NotificationIcon.png',
			requireInteraction: sticky || false
		}
		if (altText && typeof altText === 'string') notificationContent.contextMessage = altText;
		var id = 'notification_' + Date.now();
		chrome.notifications.create(id, notificationContent, function() {
			notifications.active.set(id, url);
		});
		return id;
	},
	"update": function(id, options) {
		chrome.notifications.update(id, options);
	},
	"clear": function(id, timeout) {
		setTimeout(function() {
			chrome.notifications.clear(id);
		}, timeout || 0);
	}
}

chrome.notifications.onClicked.addListener(function(id) {
	if (notifications.active.get(id)) chrome.tabs.create({url: notifications.active.get(id)});
	chrome.notifications.clear(id);
})

chrome.notifications.onClosed.addListener(function(id) {
	notifications.active.delete(id);
});

///////////////////////////////////
// Misc webRequest modifications //
///////////////////////////////////

chrome.webRequest.onBeforeRequest.addListener(function(details) {
	var tabURL = $('<a>').attr('href', details.url)[0];

	// Redirect KissAnime.com request to KissAnime.ru
	if (tabURL.hostname === 'kissanime.com') return {redirectUrl: 'http://kissanime.ru' + tabURL.pathname}
	if (tabURL.hostname === 'kissanime.io') return {redirectUrl: 'http://kissanime.ru'}

}, {
	urls: ['<all_urls>']
}, ['blocking'])


/////////////////////
// MAL Integration //
/////////////////////

var malAuth = {
	user: null,
	auth: null,
	loggedIn: false
}

chrome.storage.local.get(['MALuser', 'MALauth'], function(MAL) {
	malAuth.user = MAL.MALuser;
	malAuth.auth = MAL.MALauth;
	 if (malAuth.auth) malAuth.loggedIn = true;
});

/* == Limiting the number of invalid logins to prevent temp IP bans == */

/*var malAPILimit = {
	current: 0,
	max: 5,
	blocked: false
};

chrome.webRequest.onResponseStarted.addListener(function(details) {
	console.log('MAL Request', details);
	if (details.tabId === -1 && details.statusCode === 401) {
		malAPILimit.current++;
		if (malAPILimit.current === malAPILimit.max) {
			malAPILimit.blocked = true
			setTimeout(() => {
				malAPILimit.blocked = false;
				malAPILimit.current = 0;
			}, 300000); // Timeout for 5 minutes
		}
	}
	if (details.tabId === -1 && details.statusCode === 403) {
		malAPILimit.blocked = true
		setTimeout(() => {
			malAPILimit.blocked = false;
			malAPILimit.current = 0;
		}, 300000); // Timeout for 5 minutes
	}
}, {
	urls: ['https://myanimelist.net/api/*'],
	types: ["xmlhttprequest"]
}, ["responseHeaders"]);*/

function prepareJSON(xml) {
	var a = xml2json(xml, "	");
	try { return JSON.parse(a) }
	catch (err) {}
}

function convertSpecialChars(a) {
	return a.replace(/&amp;/gi, '&') // only one for now
}

function clearAuth() {
	chrome.storage.local.set({MALLoggedIn: false});
	chrome.storage.local.remove(['MALuser', 'MALauth']);
	malAuth.user = null;
	malAuth.auth = null;
	malAuth.loggedIn = false;
}

var mal = {
	"auth": function(action, auth) {
		return new Promise(function(resolve, reject) {

			var authHeader = action ? btoa(`${auth.user}:${auth.pass}`) : 'Og==';

			// if (action && malAPILimit.blocked) return reject({success: false, data: 'Due to failed authentication requests, the request was not completed. We will try again in a few minutes.', error: 429});

			$.ajax({
				url: "https://myanimelist.net/api/account/verify_credentials.xml",
				headers: { Authorization: 'Basic ' + authHeader },
				timeout: 10000,
				success: function(data) {
					try {
						data = JSON.parse(xml2json(data, '	'));
					} catch(err) {
						clearAuth();
						return reject({success: false, status: 0, data: "Error parsing JSON"});
					}
					chrome.storage.local.set({
						MALLoggedIn: true,
						MALuser: auth.user,
						MALauth: authHeader
					});
					malAuth.user = auth.user;
					malAuth.auth = authHeader;
					malAuth.loggedIn = true;
					return resolve({success: true});
				},
				error: function(error) {
					console.error(error);
					clearAuth();
					reject({success: false, status: error.status, data: error.responseText});
				}
			});

		});
	},
	"search": function(titles, path) {
		return new Promise(function(resolve, reject) {

			console.log('Titles:', titles);
			console.log('Path:', path);

			path ? path = path.replace('-Dub', '').replace('/Anime/', '').toLowerCase() : '/';

			// if (malAPILimit.blocked) return reject({success: false, data: 'Due to failed authentication requests, the request was not completed. We will try again in a few minutes.', error: 429});

			mal.checkDB(path).then(function(info) {

				$.ajax({
					url: "https://myanimelist.net/api/anime/search.xml",
					headers: { Authorization: 'Basic ' + malAuth.auth },
					timeout: 10000,
					data: `q=${encodeURIComponent(info.data.title)}`,
					success: function(data) {

						if (data) {

							try {
								data = JSON.parse(xml2json(data, '	'));
							} catch(err) {
								console.debug(err);
							}

							var returnData;
							var entry = data.anime.entry;

							console.group('%cAll Search Results', 'color:orangered');
							console.log(info.data.title);
							console.log(data);
							console.groupEnd();

							if ($.isArray(entry)) {

								console.log(entry);

								for (index in entry) {

									info.data.title = info.data.title.toLowerCase();
									var title = entry[index].title.toLowerCase();
									var synonyms = entry[index].synonyms ? entry[index].synonyms.toLowerCase().split('; ') : [];
									var english = entry[index].english ? entry[index].english.toLowerCase() : '';

									console.group('%cResult', 'color:orangered');
									console.log('Search Title:', info.data.title);
									console.log('Anime Title:', title);
									console.log('Synonyms:', synonyms);
									console.log('English:', english);
									console.groupEnd();

									if (info.data.id === parseInt(entry[index].id)) {
										returnData = entry[index];
										break;
									}

								}

							} else {

								console.log(data.anime.entry);

								info.data.title = info.data.title.toLowerCase();
								var title = entry.title.toLowerCase();
								var synonyms = entry.synonyms ? entry.synonyms.toLowerCase().split('; ') : [];
								var english = entry.english ? entry.english.toLowerCase() : '';

								console.group('%cResult', 'color:orangered');
								console.log('Search Title:', info.data.title);
								console.log('Anime Title:', title);
								console.log('Synonyms:', synonyms);
								console.log('English:', english);
								console.groupEnd();

								if (info.data.id === parseInt(entry.id)) {
									returnData = entry;
								}

							}

							if (returnData) {

								console.log('Return Data:', returnData);

								return mal.checkUser(parseInt(returnData.id)).then(function(malData) {

									return resolve({
										success: true,
										data: {
											user: malData.inUserMAL ? malData : null,
											mal: returnData,
											inDB: true
										}
									});

								}).catch(function(error) {

									return reject({success: false, data: error.data});

								});

							}

						}

						return reject({success: false, data: "No Results"});

					},
					error: function(error) {
						reject({"success": false, "data": error.responseText});
					}
				});

			}).catch(function() {

				var i = 0;

				(function doSearch() {

					$.ajax({
						url: "https://myanimelist.net/api/anime/search.xml",
						headers: { Authorization: 'Basic ' + malAuth.auth },
						timeout: 10000,
						data: `q=${encodeURIComponent(titles[i])}`,
						success: function(data) {

							console.debug(`${i + 1}/${titles.length}`);

							if (data) {

								try {
									data = JSON.parse(xml2json(data, '	'));
								} catch(err) {
									console.debug(err);
								}

								console.log(data);

								var returnData;
								var entry = data.anime.entry;

								console.group('%cSearch Results', 'color:orangered');
								console.log(titles[i]);
								console.log(data);
								console.groupEnd();

								if ($.isArray(entry)) {

									console.log(entry);

									for (index in entry) {

										titles[i] = titles[i].toLowerCase();
										var title = convertSpecialChars(entry[index].title.toLowerCase());
										var synonyms = entry[index].synonyms ? entry[index].synonyms.toLowerCase().split('; ') : [];
										var english = entry[index].english ? entry[index].english.toLowerCase() : '';

										console.group('%cResult', 'color:orangered');
										console.debug('Search Title:', titles[i]);
										console.debug('Anime Title:', title);
										console.debug('Synonyms:', synonyms);
										console.debug('English:', english);
										console.groupEnd();

										if (title === titles[i] || english === titles[i] || $.inArray(titles[i], synonyms) > -1) {
											returnData = entry[index];
											break;
										}

									}

								} else {

									console.log(data.anime.entry);

									titles[i] = titles[i].toLowerCase();
									var title = convertSpecialChars(entry.title.toLowerCase());
									var synonyms = entry.synonyms ? entry.synonyms.toLowerCase().split('; ') : [];
									var english = entry.english ? entry.english.toLowerCase() : '';

									console.group('%cResult', 'color:orangered');
									console.debug('Search Title:', titles[i]);
									console.debug('Anime Title:', title);
									console.debug('Synonyms:', synonyms);
									console.debug('English:', english);
									console.groupEnd();

									if (title === titles[i] || english === titles[i] || $.inArray(titles[i], synonyms) > -1) {
										returnData = entry;
									}

								}

								if (returnData) {

									console.log(returnData);

									return mal.checkUser(parseInt(returnData.id)).then(function(malData) {

										return resolve({
											success: true,
											data: {
												user: malData.inUserMAL ? malData : null,
												mal: returnData,
												inDB: false
											}
										});

									}).catch(function(error) {

										return reject({success: false, data: error.data});

									});

								}

							}

							i++;

							if (i < titles.length) return setTimeout(() => doSearch(), 500);
							else if (i === titles.length) reject({success: false, data: "No Results"});

						},
						error: function(error) {
							reject({"success": false, "data": error.responseText});
						}
					});

				})();

			});
		});
	},
	"checkUser": function(id) {
		return new Promise(function(resolve, reject) {
			if (!malAuth.user) return reject({success: false, data: 'No user'})
			$.ajax({
				url: 'https://myanimelist.net/malappinfo.php',
				data: `u=${malAuth.user}&status=all&type=anime`,
				success: function(data) {
					try {
						var jsonData = xml2json(data, '	').replace(/ 	/g, '');
						data = JSON.parse(jsonData);
					} catch(err) {
						return reject({success: false, data: "Error parsing JSON"});
					}
					if (data.myanimelist) {
						for (i in data.myanimelist.anime) {
							if (id === parseInt(data.myanimelist.anime[i].series_animedb_id)) return resolve({success: true, inUserMAL: true, data: data.myanimelist.anime[i]});
						}
						return resolve({success: true, inUserMAL: false, data: "Not in user's MAL"});
					} else {
						return reject({success: false, data: "Invalid User"});
					}
				}
			});
		});
	},
	"addAnime": function(id, status) {
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: `https://myanimelist.net/api/animelist/add/${id}.xml`,
				method: "POST",
				headers: { Authorization: 'Basic ' + malAuth.auth },
				data: `data=<?xml version="1.0" encoding="UTF-8"?><entry><status>${status}</status></entry>`,
				success: function(data) {
					console.log(data);
					resolve({success: true, data: data});
				},
				error: function(error) {
					console.error(error);
					reject({success: false, data: error.responseText});
				}
			})
		});
	},
	"removeAnime": function(id) {
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: `https://myanimelist.net/api/animelist/delete/${id}.xml`,
				method: "DELETE",
				headers: { Authorization: 'Basic ' + malAuth.auth },
				success: function(data) {
					console.log(data);
					resolve({success: true, data: data});
				},
				error: function(error) {
					console.error(error);
					reject({success: false, data: error.responseText});
				}
			})
		});
	},
	"updateEpisode": function(id, episode) {
		return new Promise(function(resolve, reject) {

			return mal.checkUser(id).then(function(malData) {

				var response;
				var date = new Date();
				var dateFull = ((date.getMonth() + 1).toString().length === 1 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + (date.getDate().toString().length === 1 ? '0' + date.getDate() : date.getDate()) + date.getFullYear();
				var startDate = malData.data.my_start_date;
				var seriesEpisodes = parseInt(malData.data.series_episodes);
				var myStatus = parseInt(malData.data.my_status);
				episode = parseInt(episode);

				if (startDate === "0000-00-00" && episode === 1) {
					console.debug('User does not have a date set. Setting Date.');
					response = `data=<?xml version="1.0" encoding="UTF-8"?><entry><episode>${episode}</episode><date_start>${dateFull}</date_start><status>1</status></entry>`;
				} else if (seriesEpisodes === episode && seriesEpisodes !== 0) {
					console.debug('Anime Finished. Setting Completed Date.');
					response = `data=<?xml version="1.0" encoding="UTF-8"?><entry><episode>${episode}</episode><date_finish>${dateFull}</date_finish><status>2</status></entry>`;
				} else if (episode > 0 && episode < seriesEpisodes && myStatus === 6) {
					console.debug('Found Date. Status is set to PTW.');
					response = `data=<?xml version="1.0" encoding="UTF-8"?><entry><episode>${episode}</episode><status>1</status></entry>`;
				} else {
					console.log('Found Date. Updating Normally.');
					response = `data=<?xml version="1.0" encoding="UTF-8"?><entry><episode>${episode}</episode></entry>`;
				}

				$.ajax({
					url: `https://myanimelist.net/api/animelist/update/${id}.xml`,
					method: 'POST',
					headers: { Authorization: 'Basic ' + malAuth.auth },
					data: response,
					success: function(data) {
						resolve({success: true, data: data});
					},
					error: function(data) {
						reject({success: false, data: data.responseText})
					}
				});

			}).catch(function(error) {
				reject({success: false, data: error});
			});

		});
	},
	"updateStatus": function(id, status) {
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: `https://myanimelist.net/api/animelist/update/${id}.xml`,
				method: 'POST',
				headers: { Authorization: 'Basic ' + malAuth.auth },
				data: `data=<?xml version="1.0" encoding="UTF-8"?><entry><status>${status}</status></entry>`,
				success: function(data) {
					console.log(data);
					resolve({success: true, data: data});
				},
				error: function(error) {
					console.error(error);
					reject({success: false, data: error.responseText});
				}
			});
		});
	},
	"updateScore": function(id, score) {
		return new Promise(function (resolve, reject) {
			$.ajax({
				url: `https://myanimelist.net/api/animelist/update/${id}.xml`,
				method: 'POST',
				headers: { Authorization: 'Basic ' + malAuth.auth },
				data: `data=<?xml version="1.0" encoding="UTF-8"?><entry><score>${score}</score></entry>`,
				success: function(data) {
					console.log(data);
					resolve({success: true, data: data});
				},
				error: function(error) {
					console.error(error);
					reject({success: false, data: error.responseText});
				}
			});
		});
	},
	"updateDates": function(id, dates) {
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: `https://myanimelist.net/api/animelist/update/${id}.xml`,
				method: 'POST',
				headers: { Authorization: 'Basic ' + malAuth.auth },
				data: `data=<?xml version="1.0" encoding="UTF-8"?><entry><date_start>${dates[0]}</date_start><date_finish>${dates[1]}</date_finish></entry>`,
				success: function(data) {
					console.log(data)
					resolve({success: true, data: data});
				},
				error: function(error) {
					console.error(error);
					reject({success: false, data: data.responseText});
				}
			});
		});
	},
	"checkDB": function(path) {
		return new Promise(function(resolve, reject) {
			if (!path) return reject({success: false, data: "no-path"});
			$.ajax({
				url: "https://efka.pilar.moe/api/malDB",
				method: "POST",
				timeout: 5000,
				contentType: "application/json",
				data: JSON.stringify({
					"url": path
				}),
				success: function(data) {
					if (data.success) resolve({success: true, data: data.data});
					else reject({success: false, data: data.description});
				},
				error: function(error) {
					reject({success: false, data: error.description});
				}
			});
		});
	},
	"MAL2KissAnime": function(titles) {
		return new Promise(function(resolve, reject) {
			var i = 0;
			(function doRequest() {
				$.ajax({
					url: 'http://kissanime.ru/Search/SearchSuggestx',
					data: 'type=Anime&keyword=' + titles[i],
					method: 'POST',
					success: function(response) {
						if (response) {
							resolve({success: true, code: 200, data: response});
						} else {
							i++; if (i < titles.length) doRequest();
							else reject({success: false, code: 404, data: 'No Results'});
						}
					},
					error: function(error) {
						if ($(error.responseText).find('.cf-browser-verification').length) reject({success: false, code: 0, data: 'Cloudflare cookie does not exist'});
						else reject({success: false, code: error.status, data: error.statusText});
					}
				});
			})()
		});
	}
}

var kitsu = {
	verifyLogin: function() {

	},
	search: function(titles, path) {
		return new Promise(function(resolve, reject) {

			var i = 0;

			(function doSearch() {

				$.ajax({
					url: "https://kitsu.io/api/edge/anime" ,
					timeout: 10000,
					data: encodeURIComponent(`filter[text]=${titles[i]}`),
					contentType: 'application/vnd.api+json',
					success: function(data) {
						
						data = data.data;

						if (data.length) {

							var returnData;

							for (anime of data) {

								titles[i] = titles[i].toLowerCase();
								var title = anime.attributes.canonicalTitle.toLowerCase();
								var en = anime.attributes.titles.en ? anime.attributes.titles.en.toLowerCase() : '';
								var en_jp = anime.attributes.titles.en_jp ? anime.attributes.titles.en_jp.toLowerCase() : '';
								var ja_jp = anime.attributes.titles.ja_jp ? anime.attributes.titles.ja_jp.toLowerCase() : '';


								if (titles[i] === title || titles[i] === en || titles[i] === en_jp || titles[i] === ja_jp) {
									returnData = anime;
									break;
								}

							}

							if (returnData) {

								console.log(returnData);

								return resolve({
									success: true,
									data: {
										user: null,
										kitsu: returnData
									}
								});

							}

						}

						i++;

						if (i < titles.length) return setTimeout(() => doSearch(), 500);
						else if (i === titles.length) reject({success: false, data: "No Results"});

					}
				});

			})();

		});
	}
}

/*
	Request Codes:
	0 = Auth												[Request Code]
	1 = Search Anime ID and Status	[Request Code, Anime Title]
	2 = Add To MAL									[Request Code, Anime ID]
	3 = Remove From MAL							[Request Code, Anime ID]
	4 = Update Episode							[Request Code, Anime ID, Episode]
	5 = Update Status								[Request Code, Anime ID, Status]
	6 = Update Score								[Request Code, Anime ID, Status]
	7 = Update Dates								[Request Code, Anime ID, Dates Array]
*/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	if ('MALv2' in request) {

		request = request.MALv2;

		if (request.type === 0) {

			console.log('Request Type:', request.type, '(Check MAL Login v2)');

			mal.auth(request.action, request.auth).then(function(result) {
				sendResponse(result);
			}).catch(function(error) {
				sendResponse(error);
			});

		} else if (request.type === 1) {

			console.log('Request Type:', request.type, '(Search Anime v2)');

			mal.search(request.titles, request.path).then(function(result) {
				sendResponse(result);
			}).catch(function(error) {
				sendResponse(error);
			});

		} else if (request.type === 2) {

			console.log('Request Type:', request.type, '(Add To MyAnimeList v2)');
			console.log('Request ID:', request.id);

			mal.addAnime(request.id, 6).then(function(result) {
				sendResponse(result);
			}).catch(function(error) {
				sendResponse(error);
			});

		} else if (request.type === 3) {

			console.log('Request Type:', request.type, '(Remove From MyAnimeList v2)');
			console.log('Request ID:', request.id);

			mal.removeAnime(request.id).then(function(result) {
				sendResponse(result);
			}).catch(function(error) {
				sendResponse(error);
			});

		} else if (request.type === 4) {

			console.log('Request Type:', request.type, '(Update Anime Episode v2)');
			console.log('Request ID:', request.id);
			console.log('Request Episode:', request.episode);

			mal.updateEpisode(request.id, request.episode).then(function(result) {
				sendResponse(result);
			}).catch(function(error) {
				sendResponse(error);
			});

		} else if (request.type === 5) {

			console.log('Request Type:', request.type, '(Update Anime Status v2)');
			console.log('Request ID:', request.id);
			console.log('Request Status:', request.status);

			mal.updateStatus(request.id, request.status).then(function(result) {
				sendResponse(result);
			}).catch(function(error) {
				sendResponse(error);
			});

		} else if (request.type === 6) {

			console.log('Request Type:', request.type, '(Update Anime Score v2)');
			console.log('Request ID:', request.id);
			console.log('Request Score:', request.score);

			mal.updateScore(request.id, request.score).then(function(result) {
				sendResponse(result);
			}).catch(function(error) {
				sendResponse(error);
			});

		} else if (request.type === 7) {

			console.log('Request Type:', request.type, '(Update Anime Dates v2)');
			console.log('Request ID:', request.id);
			console.log('Request Score:', request.dates);

			mal.updateDates(request.id, request.dates).then(function(result) {
				sendResponse(result);
			}).catch(function(error) {
				sendResponse(error);
			});

		}

		return true;

	}

	if ('MAL2KissAnime' in request) {

		mal.MAL2KissAnime(request.MAL2KissAnime.titles).then(function(result) {
			sendResponse(result);
		}).catch(function(error) {
			sendResponse(error);
		})

		return true;

	}

	if ('kitsu' in request) {

		request = request.kitsu;

		if (request.type === 1) {

			console.log('Request Type:', request.type, '(Search Anime)');

			kitsu.search(request.titles, request.path).then(function(result) {
				sendResponse(result);
			}).catch(function(error) {
				sendResponse(error);
			});

		}

		return true;

	}

	if ('task' in request) {

		if (request['task'] == 'downloadAll') {

			try {
				downloadAll(request['data']);
			} catch(e) {
				chrome.permissions.contains({permissions: ['downloads']}, function(result) {
					if (result == false) {

						console.error('Essentials for KissAnime does not have permission to download!');

						chrome.permissions.request({permissions: ['downloads']}, function(granted) {

							if (granted) return downloadAll(request['data']);

							else alert('Downloads Permission Denined');

						});

					}

				});
			}

		}

	}

	if ('open' in request) {

		if (request['open'] == 'extPage') chrome.tabs.create({url: 'chrome://extensions/'});

	}

});

downloadAll = function(items) {

  item = items.shift();
  chrome.downloads.download(item, function() {
      if (items.length > 0) downloadAll(items);
  });

}

chrome.storage.local.get(function(data) {
	console.log('Local Storage:');
	console.log(data);
});
chrome.storage.sync.get(function(data) {
	console.log('Sync Storage:');
	console.log(data);
});
