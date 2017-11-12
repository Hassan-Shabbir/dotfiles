var storage = chrome.storage;

$(function() {

	$('html').attr('data-cast-api-enabled', 'true');

	$('head').inject('inline-script', function() {
		window.videojs.plugin('progressTips', function() {}); // Clears the old plugin
	});

	// $('head').inject('script', 'http://www.gstatic.com/cv/js/sender/v1/cast_sender.js');
	// $('head').inject('script', chrome.runtime.getURL('js/videojs/videojs-chromecast.js'));
	// $('head').append(`<link href="${chrome.runtime.getURL('js/videojs/videojs-chromecast.css')}" rel="stylesheet" type="text/css">`);

});

$(document).ready(function() {

	$('#selectServer').on('change', function() {
		var server = this.value.replace(/\/Anime\/.+s=/g, '');
		console.log('Selected Server:', server);
		chrome.storage.sync.set({'lastServer': server});
	});

	$('head').append('<style id="style-iframe">#divContentVideo iframe {display: none}</style>');

	$('#divContentVideo').append('<div id="loadingVideo"><div class="loading-pulse loading-pulse-absolute"></div><div class="loading-pulse-text">Loading Video...</div></div>');

	if ( /(?:[\w-]+\.)+[\w-]+/.exec($('#divContentVideo iframe').attr('src')) == "openload.co" ) {

		window.videohost = 'Openload';

		var openloadTimeout = setTimeout(fallback, 5000);

		window.addEventListener('message', function(e) {

			if (e.origin !== "https://openload.co")	return;

			if (e.data[0] == 'OpenloadURL') {
				clearTimeout(openloadTimeout);
				console.log(e.data);
				$('#divContentVideo').append(`<video id="my_video_1" class="video-js vjs-default-skin vjs-big-play-centered" src=${e.data[1]} autoplay controls preload="auto" width="854px" height="552px"><source src=${e.data[1]} type="video/mp4"></video>`);
				$('iframe[src*="openload.co"]').remove();
				doVideoJS();
			}

		});

	} else if ( /(?:[\w-]+\.)+[\w-]+/.exec($('#divContentVideo iframe').attr('src')) == "www.rapidvideo.com" ) {

		window.videohost = 'RapidVideo.com';

		var rapidVideoTimeout = setTimeout(fallback, 5000);

		window.addEventListener('message', function(e) {

			if (e.origin !== "https://www.rapidvideo.com") return;
			
			if (e.data[0] == 'RapidVideoURL') {

				clearTimeout(rapidVideoTimeout);
				console.log(e.data);
				$('#divContentVideo').append(`<video id="my_video_1" class="video-js vjs-default-skin vjs-big-play-centered" src=${e.data[1]} autoplay controls preload="auto" width="854px" height="552px"><source src=${e.data[1]} type="video/mp4"></video>`);
				$('iframe[src*="rapidvideo.com"]').remove();
				doVideoJS();
			
			}

		});

	} else if ( /(?:[\w-]+\.)+[\w-]+/.exec($('#divContentVideo iframe').attr('src')) == "streamango.com" ) {

		window.videohost = 'Streamango.com';

		var streamangoTimeout = setTimeout(fallback, 5000);

		window.addEventListener('message', function(e) {

			if (e.origin !== "https://streamango.com") return;
			
			if (e.data[0] == 'StreamangoURL') {

				var sources = e.data[1].map(function(source) {
					return { source: source.src, label: source.height }
				})

				if (sources.length === 0) return fallback();

				clearTimeout(streamangoTimeout);
				console.log(e.data);
				$('#divContentVideo').append(`<video id="my_video_1" class="video-js vjs-default-skin vjs-big-play-centered" src=${sources.last().source} autoplay controls preload="auto" width="854px" height="552px"><source src=${sources.last().source} type="video/mp4"></video>`);
				$('iframe[src*="streamango.com"]').remove();
				doVideoJS();
			
			}

		});

	} else {

		window.videohost = 'KissAnime';

		if ( $('#selectPlayer').val() == 'html5' ) {

			var videoURL = $('#my_video_1_html5_api').attr('src');

			var isAutoplay;
			if (!Cookies.get('usernameK')) isAutoplay = 'autoplay';
			else isAutoplay = $('#my_video_1_html5_api').attr('autoplay') || '';

			$('#my_video_1').remove();

			$('#divContentVideo').append(`<video id="my_video_1" class="video-js vjs-default-skin vjs-big-play-centered" src=${videoURL} ${isAutoplay} controls preload="auto" width="854px" height="552px"><source src=${videoURL} type="video/mp4"></video>`);

			setTimeout(() => doVideoJS(), 1000); // Timeout is required to allow the chromecast plugin time to load.

		} else if ( $('#selectPlayer').val() == 'flash' ) {

			startVideopageJS();

		}

	}

	function fallback() {
		$('#loadingVideo, #style-iframe').remove();
		startVideopageJS();
	}

	function doVideoJS(sources) {

		if (sources && sources.length > 0) {

			$('body').append(`<select id="slcQualix" class="selectQuality"></select>`);

			for (var source of sources) {
				$('.selectQuality').append(`<option value="${source.file}">${source.label}</option>`);
			}

			$('.selectQuality').change(function() {
				var player = $('#my_video_1_html5_api')[0];
				var oldTime = player.currentTime;
				player.src = this.value;
				player.play();
				$(player).on("loadedmetadata", function() {                        
					player.currentTime = oldTime;                                                    
				});
			});

		}

		$('#loadingVideo').remove();

		$('body').inject('inline-script', function startVideoJS() {

			videojs(document.getElementById('my_video_1'), {
				chromecast: {
					appId:'Essentials-for-KissAnime',
					metadata:{
						title:'Essentials for KissAnime',
						subtitle:'Episode Unknown',
					}
				},
				nativeControlsForTouch: false,
				controlBar: {
					children: [
						"PlayToggle",
						"CurrentTimeDisplay",
						"TimeDivider",
						"DurationDisplay",
						"TimeDivider",
						"RemainingTimeDisplay",
						"progressControl",
						"fullscreenToggle",
						"chromeCastButton",
						"volumeControl",
						"muteToggle"
					]
				}
			});

			window.myPlayer = videojs('my_video_1');

			myPlayer.ready(function() {

				$('.barContent #centerDivVideo, .barContent #divContentVideo, .barContent  #my_video_1').css({
					'height': '504px',
					'width': '896px'
				});

				this.hotkeys({
					volumeStep: 0.1,
					seekStep: 3,
					enableMute: true,
					enableFullscreen: true,
					enableNumbers: true
				});

				this.on('error', function(error) {
					$('.vjs-error-display').remvoeClass('vjs-hidden');
					$('.vjs-error-display .vjs-modal-dialog-content').text('An error has occured when trying to play the media. Try again later. If the issue persist, try a different video host.');
				});

				$('.vjs-control-bar').prepend('<div class="vjs-control-bar-shadow"></div>');

				/* == Moves the Quality Selector to the Player Control bar == */
				var qualitySelector = $('.selectQuality').detach();
				$('#divQuality').remove();
				$('.vjs-mute-control').after(qualitySelector);
				if ($('.selectQuality').length) $('#videoRefresh').css('padding-right', '10px');

				/* Shows the player once it's ready. Did this because I couldn't figure out how to not make it look fugly when loading. */
				$('#my_video_1').show();

				console.log('Player Ready');

			});
			

		});

		startVideopageJS();

	}

	function startVideopageJS() {

		///////////////////////////////////////////////
		// Things that are used throughout this file //
		///////////////////////////////////////////////

		function removeVideoAds(onlyBebi) {

			$(document).arrive('a[href*="bebi.com"]', function rightSideAd() {
				$(this).closest('div').not('body').remove();
				$(this).remove();
				$('script:contains("bebi.com"), script[src*="bebi.com"]').remove();
				document.unbindArrive(rightSideAd);
			});

			if (onlyBebi === true) return;

			$('#divFloatLeft, #divFloatRight, #adsIfrme6, #adsIfrme7, #adsIfrme8, .divCloseBut, .barContent > div > .clear, .clear2').remove();
			$("#adsIfrme10").css({'height':'0px', 'width': '0px', 'visibility': 'hidden'});
			setTimeout(function() {$("#adsIfrme10").remove();},5000);
			//$('#centerDivVideo').css("margin-top", "10px");
			$('#centerDivVideo').css("margin-top", "-10px");
			$('#playerSwitchLightsOffContainer').detach().insertAfter('#centerDivVideo');
			$('#playerSwitchLightsOffContainer').css("margin-top", "10px");

		}

		var currentPlayer = $('#selectPlayer').val(); // Gets the Current Player Type
		var currentServer = getParameterByName( 's' , $('#selectServer').val() );

		var isHTML5 = ( (currentPlayer =='html5' && $('#my_video_1_html5_api').length) || ( (currentServer == 'openload' || currentServer == 'stream') && $('#my_video_1_html5_api').length ) ? true : false );
		var isYTFlash = ( currentPlayer == 'flash' && currentServer == 'kissanime' && $('#embedVideo').length ? true : false );
		var isIFrame = ( (currentServer == 'openload' || currentServer == 'rapidvideo') ? true : false );

		console.log('Is HTML5 Player:', isHTML5);
		console.log('Is YouTube Flash Player:', isYTFlash);
		console.log('Is iFrame Player:', isIFrame);

		var centerDivVideo = $('#centerDivVideo');
		var currentAnimeURL = $('#navsubbar a').attr('href');
		var AnimeTitle = $('#navsubbar a').text().replace('information', '').replace('Anime', '').trim();
		var currentEpisode = $('#selectEpisode option:selected').text().trim();

		$('#selectEpisode').parent().parent().attr('id', 'selectEpisodeContainer');
		$('#switch').parent().attr('id', 'playerSwitchLightsOffContainer');
		$('#selectEpisodeContainer').append('<div class="clear"></div>');

		$('#playerSwitchLightsOffContainer').append('<div style="clear:both"></div>');

		$('#divQuality > select').addClass('selectQuality');

		var arriveFun = {};

		////////////////////////////////////////////
		// Overwrite KissAnime DoDetect functions //
		////////////////////////////////////////////

		$('head').inject('inline-script', function makeAnimeGreatAgain() {
			console.log('%cEssentials for KissAnime: DoDetect1 and DoDetect2 functions overwritten!', 'color:blue');
			window.DoDetect1 = function() {
				console.log('Nope');
			};
			window.DoDetect2 = function() {
				console.log('Nada');
			};
		});

		//////////////////////////////////////////////////////////////////
		// Used to detect Playback status change for the YouTube Player //
		//////////////////////////////////////////////////////////////////

		if (isYTFlash) {
			$('head').inject('inline-script', function() {
				var player = document.getElementById('embedVideo');
				window.onYouTubePlayerReady = function() {
					player.addEventListener("onStateChange", "onytplayerStateChange");
					player.pauseVideo();
					player.playVideo();
				};
				window.onytplayerStateChange = function(newState) {
				  $('#embedVideo').attr('data-playerStatus', newState);
				};
			});
		}

		chrome.storage.sync.get(function(items) {

			////////////////
			// REMOVE ADS //
			////////////////

			if (items.enableVideoPageAds == false) removeVideoAds();

			/////////////////////////////
			// REMOVE PLAYER SWITCHERS //
			/////////////////////////////

			if (items.enablePlayerSwitchers == false) $('#playerSwitchLightsOffContainer > div:first-child').hide();

			///////////////////////
			// REMOVE LIGHTS OFF //
			///////////////////////

			if (items.enableLightsOff == false) $('#switch').style('display', 'none', 'important');

			///////////////////////////
			// REMOVE DOWNLOAD LINKS //
			///////////////////////////

			if (items.enableDownloadLinks == false) $('#divDownload').hide();

			///////////////////////
			// REMOVE FILE NAMES //
			///////////////////////

			if (items.enableFileName == false) {
				var bookmarklink = $('#divBookmark').detach();
				$('#divFileName').empty();
				$('#divFileName').append(bookmarklink);
			}

			//////////////////////////////////////
			// DISABLE VIDEO PAGE BOOKMARK LINK //
			//////////////////////////////////////

			if (items.enableBookmarkLink == false) $("#divBookmark").hide();

		});
		
		///////////////////////////
		// Refreshes HTML5 Video //
		///////////////////////////

		if (isHTML5) {

			$('.vjs-mute-control').after('<div id="videoRefresh">Reload Video</div>');

			$('#videoRefresh').css({
				'float': 'right',
				'position': 'relative',
				'top': '5px',
				'cursor': 'pointer',
				'line-height': '18px'
			});

			var currentTimeInt;

			$('#my_video_1_html5_api').on('timeupdate.efka_timeupdate', function() {
				if (this.paused == false) currentTimeInt = document.getElementById('my_video_1_html5_api').currentTime;
			});

			$('body').inject('inline-script', function() {

				myPlayer.off('error');
				myPlayer.off('loadedmetadata');
				// Fixing KissAnime's mistakes in this function...Also changing some things to fit my needs.
				window.SetPlayer = function(code) {
					var currentTime = myPlayer.currentTime();
					myPlayer.src({ type: "video/mp4", src: code });
					$('#my_video_1').focus();
					if (changeQualityTimer > 0) {
						myPlayer.play();
					} else {
						window.scrollTo(0, 0);
					}
					myPlayer.currentTime(currentTime);
					if (document.cookie.indexOf("videojsVolume") > 0) {
						myPlayer.volume(GetCookie('videojsVolume'));
					}
				};

			});

			$('#videoRefresh').click(function() {
				document.getElementById('my_video_1_html5_api').load();
				document.getElementById('my_video_1_html5_api').currentTime = currentTimeInt;
			});

			var isChecking = false;

			// $('#my_video_1_html5_api').on('error', function() {
			// 	// If the video url expired, this wil fetch the new video url.
			// 	if (getExpireDate() < new Date() && isChecking == false) {
			// 		isChecking = true;
			// 		$.ajax({
			// 			url: window.location.href,
			// 			type: "GET",
			// 			success: function(data) {
			// 				var currentQuality = $('.selectQuality option:selected').text();
			// 				$('.selectQuality').html( $(data).find('.selectQuality').html() );
			// 				$('.selectQuality').val( $('.selectQuality option:contains('+currentQuality+')').val() );
			//
			// 				$('#my_video_1_html5_api').attr('src', asp.wrap( $('.selectQuality option:contains('+currentQuality+')').val() ) );
			// 				document.getElementById('my_video_1_html5_api').currentTime = currentTimeInt;
			// 				document.getElementById('my_video_1_html5_api').load();
			// 				isChecking = false;
			// 			}
			// 		});
			// 	} else if (isChecking == false) {
			// 		document.getElementById('my_video_1_html5_api').load();
			// 		document.getElementById('my_video_1_html5_api').currentTime = currentTimeInt;
			// 	}
			// });

		}

		function getExpireDate() {
			var expireDateEpoch = parseInt(getParameterByName('expire', $('#my_video_1_html5_api').attr('src')));
			var expireDate = new Date(0);
			expireDate.setUTCSeconds(expireDateEpoch);
			return expireDate;
		}

		//////////////////////////////////////////////
		// Custom Context Menu for HTML5 Video Page //
		//////////////////////////////////////////////

		if (isHTML5) {
			$('#my_video_1').append('<div id="contextmenu" class="contextmenu"></div>');
			$('#contextmenu').load(chrome.runtime.getURL('InjectedHTML/VideoPageContextMenu.html'), function() {
				var html5player = $('#my_video_1_html5_api');
				$('html').on('click', function() {
					if ($('#contextmenu').is(':visible') == true) {
						$('#contextmenu').hide();
					}
				});
				html5player.on('contextmenu', function(e) {
					$('.contextmenu').hide();
					$('#contextmenu').show();
					$('#contextmenu').offset({ top: e.pageY, left: e.pageX});
					event.preventDefault();
				});
				$(window).resize(function() {
					$('.contextmenu').hide();
				});
				$('.ccmLoop').click(function() {
					if (html5player.attr('loop')) {
						html5player.attr('loop', false);
						$(this).removeClass('active');
					} else {
						html5player.attr('loop', true);
						$(this).addClass('active');
					}
				});
				$('.ccmControls').click(function() {
					if (html5player.attr('controls')) {
						html5player.attr('controls', false);
						$(this).removeClass('active');
					} else {
						html5player.attr('controls', true);
						$(this).addClass('active');
					}
				});
				$('.ccmVJSControls').click(function() {
					if ($('.vjs-control-bar').is(':visible')) {
						$('.vjs-control-bar').hide();
						$(this).addClass('active');
					} else {
						$('.vjs-control-bar').show();
						$(this).removeClass('active');
					}
				});
				// Control Bar //
				var controlbar = $('.vjs-control-bar');
				controlbar.attr('data-postion', 'bottom');
				chrome.storage.sync.get('html5ControlsPos', function(items) {
					if (items.html5ControlsPos) {
						if (items.html5ControlsPos == 'bottom') {
							$('.ccmCPContainer .option').removeClass('active');
							$('.ccmCPBottom').addClass('active');
							controlbar.attr('data-postion', 'bottom').removeClass('controlTop');
							$('#statusStyle').remove();
						} else {
							$('.ccmCPContainer .option').removeClass('active');
							$('.ccmCPTop').addClass('active');
							controlbar.attr('data-postion', 'top').addClass('controlTop');
							$('head').append('<style id="statusStyle">#status { bottom:5px; top:initial !important; }</style>');
						}
					} else {
						controlbar.attr('data-postion', 'bottom');
					}
				});

				$('.ccmControlsPos, .ccmCPContainer').hover(function() {
					$('.ccmCPContainer').show();
				}, function() {
					$('.ccmCPContainer').hide();
				});
				$('.ccmCPBottom').click(function() {
					if (controlbar.attr('data-postion') != 'bottom') {
						chrome.storage.sync.set({html5ControlsPos: 'bottom'});
						$('.ccmCPContainer .option').removeClass('active');
						$(this).addClass('active');
						controlbar.attr('data-postion', 'bottom').removeClass('controlTop');
						$('#statusStyle').remove();
					}
				});
				$('.ccmCPTop').click(function() {
					if (controlbar.attr('data-postion') != 'top') {
						chrome.storage.sync.set({html5ControlsPos: 'top'});
						$('.ccmCPContainer .option').removeClass('active');
						$(this).addClass('active');
						controlbar.attr('data-postion', 'top').addClass('controlTop');
						$('head').append('<style id="statusStyle">#status { bottom:5px; top:initial !important; }</style>');
					}
				});

				// Open in New Tab //
				$('.ccmTab').click(function() {
					window.open(html5player.attr('src'));
				});

				$(document).on('click', '.ccmWindow', function() {
					window.open($('#my_video_1_html5_api').attr('src'), "KissAnime", "width=1280, height=720");
				});

				// Save Video As... //
				if (html5player.attr('src').indexOf('googlevideo.com') > -1) {
					$('.ccmSave').attr('href', html5player.attr('src') + '&title=' + encodeURI(AnimeTitle+' '+currentEpisode+' ['+$('.selectQuality option:selected').text()+']'));
					$('.selectQuality').on('change', function() {
						$('.ccmSave').attr('href', html5player.attr('src') + '&title=' + encodeURI(AnimeTitle+' '+currentEpisode+' ['+$('.selectQuality option:selected').text()+']'));
					});
				} else {
					$('.ccmSave').attr('href', html5player.attr('src'));
					$('.selectQuality').on('change', function() {
						$('.ccmSave').attr('href', html5player.attr('src'));
					});
				}

				// Copy Video URL //
				$('.ccmVideoURL').click(function() {
					copyText(html5player.attr('src'));
				});

				// Copy Page URL //
				$('.ccmPageURL').click(function() {
					copyText(window.location.href);
				});

				// Copy Page URL at Current Time //
				$('.ccmPageURLTime').click(function() {
					copyText(window.location.href.replace(/&?time=([^&]$|[^&]*)/i, "") + '&time=' + html5player[0].currentTime);
				});

				// Restart Video //
				$('.ccmRestart').click(function() {
					html5player[0].currentTime = 0;
				});
			});
		}

		//////////////////////////////
		// Removes Comment Warnings //
		//////////////////////////////

		// $('#divComments > div > div[style="color: #d5f406; text-align: left"]').hide();

		///////////////////////////////////////////////
		// Stores episode link in PinnedListLW array //
		///////////////////////////////////////////////

		$(window).on("beforeunload", function() {
			chrome.storage.sync.get(['PinnedList', 'PinnedListURLs', 'PinnedListLW'], function(items) {
				if ( items.PinnedListURLs.includes( window.location.pathname.substring( 0, window.location.pathname.lastIndexOf('/')) ) ) {

					var currentURL = window.location.href.replace(/(http|https):\/\/kissanime.ru/g, '').replace(/&?s=([^&]$|[^&]*)/i, "").replace(/&?time=([^&]$|[^&]*)/i, "");

					var pathname =  currentURL.substring( 0, currentURL.lastIndexOf( '/' ) );

					var pos = items.PinnedListURLs.indexOf( currentURL.substring( 0, currentURL.lastIndexOf( '/' ) ) );


					//var pos = items.PinnedListURLs.indexOf(window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')));

					var newPinnedListLW = items.PinnedListLW;

					if ($('#my_video_1_html5_api').length) {

						if (document.getElementById('my_video_1_html5_api').duration - 40 < document.getElementById('my_video_1_html5_api').currentTime) {

							if ($('#selectEpisode option:selected').next().length) {

								newPinnedListLW[pos] = pathname + '/' + $('#selectEpisode option:selected').next().val() + '#' + $('#selectEpisode option:selected').next().text().trim();
								chrome.storage.sync.set({PinnedListLW: newPinnedListLW});

							} else {

								newPinnedListLW[pos] = 'null';
								chrome.storage.sync.set({PinnedListLW: newPinnedListLW});

							}

						} else if (document.getElementById('my_video_1_html5_api').ended == false) {

							newPinnedListLW[pos] = currentURL + getTime() + '#' + currentEpisode;
							chrome.storage.sync.set({PinnedListLW: newPinnedListLW});

						} else {

							//newPinnedListLW[pos] = 'null';
							//chrome.storage.sync.set({PinnedListLW: newPinnedListLW});

						}

					} else if ($('#embedVideo').length) {

						if (document.getElementById('embedVideo').getDuration() - 40 < document.getElementById('embedVideo').getCurrentTime()) {
							if ($('#selectEpisode option:selected').next().length) {
								newPinnedListLW[pos] = pathname + '/' + $('#selectEpisode option:selected').next().val() + '#' + $('#selectEpisode option:selected').next().text().trim();
								chrome.storage.sync.set({PinnedListLW: newPinnedListLW});
							} else {
								newPinnedListLW[pos] = 'null';
								chrome.storage.sync.set({PinnedListLW: newPinnedListLW});
							}
						} else if (document.getElementById('embedVideo').getPlayerState() != 0) {
							newPinnedListLW[pos] = currentURL + getTime() + '#' + currentEpisode;
							chrome.storage.sync.set({PinnedListLW: newPinnedListLW});
						} else {
							//newPinnedListLW[pos] = 'null';
							//chrome.storage.sync.set({PinnedListLW: newPinnedListLW});
						}
					}

					function getTime() {
						if ($('#my_video_1_html5_api').length) {
							return '&time=' + document.getElementById('my_video_1_html5_api').currentTime;
						} else if ($('#embedVideo').length) {
							return '&time=' + document.getElementById('embedVideo').getCurrentTime();
						} else {
							return;
						}
					}

				}
			});
		});

		//////////////////////////////////////////////
		// Add Reddit Discussion Link to Video Page //
		//////////////////////////////////////////////

		chrome.storage.sync.get('enableFindRedditDiscussions', function(items) {
			if (items.enableFindRedditDiscussions == true) {
				$.ajax({
					url: currentAnimeURL,
					success: function(data) {

						var AnimeTitle = $(data).find('.barContent > div > a.bigChar').text().replace('(Sub)', '').replace('(Dub)', '');
						var otherNames = [AnimeTitle];

						$(data).find('span:contains("Other name:")').parent().find('a').each(function() {
							otherNames.push($(this).text());
						});

						var episode = $('#selectEpisode > :selected').text().trim().split("Episode").pop();
						episode = parseInt(episode);
						if (!episode) return;

						var episodeSearchTitles = [];
						for (var title of otherNames) episodeSearchTitles.push(`title:"${title.replace('(TV)', '')} - Episode ${episode}"`);
						var searchTemplate = 'subreddit:anime self:yes title:"[Spoilers]" title:"[Discussion]" (selftext:MyAnimelist OR selftext:MAL) ';
					 	var searchQuery = `https://reddit.com/r/anime/search?q=${encodeURIComponent(searchTemplate+'('+episodeSearchTitles.join(' OR ')+')')}&restrict_sr=on&sort=new&t=all`;

						 $('#divFileName').after(`<div>
							<img src="${chrome.extension.getURL('images/reddit-icon.png')}" style="vertial-align: sub; padding-right: 5px;">
							<a href="${searchQuery}" target="_blank">Reddit Discussion</a>
						</div>`);
						
					},
					error: function() {
						$.ajax(this);
					}
				});
			}
		});

		//////////////////////////////////
		// Enables Auto Episode Advance //
		//////////////////////////////////

		if (isHTML5) {
			console.debug('HTML5 Player');
		} else if ( $('#embedVideo').length ) {
			console.debug('YouTube Player');
		} else if ( $('#divContentVideo iframe').length ) {
			console.debug('iFrame Players');
		} else {
			$(document).arrive('#divContentVideo_wrapper', arriveFun.JWPlayerCheck = function() {
				console.debug('JWPlayer');
				$(document).unbindArrive(arriveFun.JWPlayerCheck);
			});
			setTimeout(function() {$(document).unbindArrive(arriveFun.JWPlayerCheck);}, 5000);
		}

		chrome.storage.sync.get('enableAutoAdvEp', function(items) {
			if (items.enableAutoAdvEp == true) {
				// Auto Advance for HTML5 Player //
				if (isHTML5) {
					$('#my_video_1_html5_api').on('ended', function() {
						$('#btnNext').click();
						//fuckThisShit();
					});
				// Auto Advance for YouTube Player
				} else if ($('#embedVideo').length) {
					observer_autoAdv = new MutationObserver(function(mutations) {
						mutations.forEach(function(mutation) {
							if ($('#embedVideo').attr('data-playerStatus') == '0' && window.malApiEnabled != true) $('#btnNext').click();
						});
					});
					observer_autoAdv.observe(document.querySelector('#embedVideo'), {attributes: true});
				// Auto Advance for JWPLAYER //
				} else {
					$(document).arrive('#divContentVideo_wrapper', arriveFun.JWPlayerCheck_autoAdvEp = function() {
						$('head').inject('inline-script', function autoAdvancejwplayer() {
							jwplayer('divContentVideo').onComplete(function() {
								$('#btnNext').click();
							});
						});
						$(document).unbindArrive(arriveFun.JWPlayerCheck_autoAdvEp);
					});
					setTimeout(function() {$(document).unbindArrive(arriveFun.JWPlayerCheck_autoAdvEp);}, 5000);
				}
			}
		});

		////////////////////////
		// Custom Video Speed //
		////////////////////////

		chrome.storage.sync.get(['enablePlaybackRate', 'enableKeyboardShortcuts'], function(items) {
			if (items.enablePlaybackRate == true) {
				if (isHTML5) {
					$('head').inject('css', chrome.runtime.getURL('/assets/css/PBRSlider.css'));
					/* $('.vjs-live-controls').hide().after('<div id="playbackRateContainer" style="display:none"></div>'); */
					$('.vjs-remaining-time').after('<div id="playbackRateContainer" style="display:none"></div>');
					$('#playbackRateContainer').append('<div id="playbackRateSlider"></div>');
					$('#playbackRateContainer').append('<div id="sliderValue">1.0x</div>');
					$('#playbackRateSlider').slider({
						slide: function( event, ui ) {
							$('#sliderValue').text(ui.value+'x');
							document.getElementById('my_video_1_html5_api').playbackRate = ui.value;
						},
						change: function(event, ui) {
							$('#sliderValue').text(ui.value+'x');
							document.getElementById('my_video_1_html5_api').playbackRate = ui.value;
						},
						max: 2,
						min: 0,
						value: 1,
						step: .05
					});
					$('#playbackRateSlider').click(function() {
						event.stopPropagation();
					});

					$('#my_video_1_html5_api').on('loadedmetadata', function() {
						$('#my_video_1_html5_api')[0].playbackRate = $("#playbackRateSlider").slider("value");
					});
				}

			}
		});

		////////////////////
		// ENABLE AUTO HD //
		////////////////////

		chrome.storage.sync.get('enableAutoHD', function(items) {

			if (items.enableAutoHD == true) {

				if (isHTML5) {

					$('body').inject('inline-script', function() {

						var highestQuality = $('#slcQualix option')[0].value;

						$('.selectQuality').val(highestQuality);

						$('.selectQuality').change();

					});

				}

			}

		});

		/////////////////////////////
		// Enable Auto Low Quality //
		/////////////////////////////

		chrome.storage.sync.get('enableAutoLQ', function(items) {

			if (items.enableAutoLQ == true) {

				if (isHTML5) {

					$('body').inject('inline-script', function() {

						var lowestQuality = $('.selectQuality option')[$('.selectQuality option').length - 1].value;

						$('.selectQuality').val(lowestQuality);

						$('.selectQuality').change();

					});

				}

			}

		});

		////////////////////////////////
		// Pauses Video on Tab Switch //
		////////////////////////////////

		chrome.storage.sync.get('enablePauseOnSwitch', function(items) {
			if (items.enablePauseOnSwitch == true) {
				var hidden;
				var vis;
				if (typeof document.webkitHidden !== "undefined") {hidden = "webkitHidden"; vis = "webkitvisibilitychange";}
				function setPlay() {
					$('head').inject('inline-script', function jwplay() {
						jwplayer('divContentVideo').play(true);
					}, true);
				}
				function setPause() {
					$('head').inject('inline-script', function jwpause() {
						jwplayer('divContentVideo').pause(true);
					}, true);
				}
				function visChange() {
					if (document[hidden]) {
						if (isHTML5) document.getElementById('my_video_1_html5_api').pause(); // HTML5 Player
						else if (isYTFlash) document.getElementById('embedVideo').pauseVideo(); // YouTube Player
						else if ($('#divContentVideo_wrapper').length) setPause(); // JWPLAYER
					}
				}
				document.addEventListener(vis, visChange, false);
			}
		});

		////////////////////////////////////////////
		// Stretch video to fill screen/container //
		////////////////////////////////////////////

		chrome.storage.sync.get(['enableStretchFullscreenVid', 'enableAutoFullscreen'], function(items) {
			if (items.enableStretchFullscreenVid == true) {
				if (items.enableAutoFullscreen == true) {
					$('#my_video_1_html5_api').css('object-fit', 'fill');
				} else {
					$(document).on('webkitfullscreenchange', function() {
						if (document.webkitIsFullScreen == true) $('#my_video_1_html5_api').css('object-fit', 'fill');
						else $('#my_video_1_html5_api').css('object-fit', '');
					});
				}
			}
		});

		//////////////////////
		// Fullscreen Video //
		//////////////////////

		chrome.storage.sync.get('enableAutoFullscreen', function(items) {
			if (items.enableAutoFullscreen == true) {

				$('#adsIfrme11').next().remove();
				$('#adsIfrme11').remove(); // Ad is going to be behind the video so no point in keeping it in the case the user is not blocking ads
				removeVideoAds(true);

				$('head').inject('css', chrome.runtime.getURL('assets/css/autoFullscreen.css'));

				// HTML5 Player //
				if (isHTML5) {

					$(document).on('click', '#scrollToVideo', function() {
						$('#my_video_1').scrollView();
					});

					$(document).ready(function() {
						$('#my_video_1').scrollView();
					});

					$('head').inject('inline-script', function() {
						window.myPlayer.ready(function () {
							this.off('dblclick');
						});
					});

					$('.vjs-fullscreen-control').hide();
					$('.vjs-volume-control').css('margin-right', '10px');

				// YouTube Player //
				} else if (isYTFlash) {

					$(document).on('click', '#scrollToVideo', function() {
						$('#embedVideo').scrollView();
					});

					$('#embedVideo').scrollView();

				// The other iFrame Players that I can't touch //
				} else if (isIFrame) {

					var videoiFrame = $('#divContentVideo iframe');

					$(document).on('click', '#scrollToVideo', function() {
						videoiFrame.scrollView();
					});

					videoiFrame.scrollView();

				} else {

					$(document).arrive('#divContentVideo_wrapper', arriveFun.JWPlayerCheck_autoFullscreen = function() {
						$(document).on('click', '#scrollToVideo', function() {
							$('#divContentVideo_wrapper').scrollView();
						});
						$('#divContentVideo_wrapper').scrollView();
						$(document).unbindArrive(arriveFun.JWPlayerCheck_autoFullscreen);
					});
					setTimeout(function() {$(document).unbindArrive(arriveFun.JWPlayerCheck_autoFullscreen);}, 5000);

				}

				$('#centerDivVideo').after('<div style="margin-top:10px"><a id="scrollToVideo" href="javascript:void(0)">(Scroll to Video)</a></div>');

				$('#centerDivVideo').css('z-index', '9999');

			}
		});

		//////////////////
		// Theater Mode //
		//////////////////

		chrome.storage.sync.get('enableTheaterMode', function(items) {
			if (items.enableTheaterMode == true) {

				removeVideoAds();

				$('head').inject('css', chrome.runtime.getURL('assets/css/theaterMode.css'));

				$('#selectEpisodeContainer').scrollView();

				if (isHTML5) {

					$('.bigBarContainer').prepend('<canvas id="backgroud-canvas"></canvas>');

					var video = $('#my_video_1_html5_api');
					// var canvas = $('#backgroud-canvas')[0];
					// var context = canvas.getContext('2d');
					// var width = canvas.width = canvas.clientWidth;
					// var height = canvas.height = canvas.clientHeight;

					// function loop() {
					// 	if (video[0].paused || video[0].ended) return;
					// 	context.drawImage(video[0], 0, 0, width, height);
					// 	requestAnimationFrame;
					// 	setTimeout(loop, 30);
					// }

					video.on('playing', function() {
						// loop();
					});

				}

			}
		});

		/////////////////////////////////
		// ALternate Video Page Layout //
		/////////////////////////////////

		chrome.storage.sync.get([
			'enableAltVideoPage',
			'enableAds',
			'enableVideoPageAds',
			'altVideoPageWidth',
			'enableSlimHeader'
		], function(items) {
			if (items.enableAltVideoPage == true) {

				removeVideoAds();

				$('#container').prepend(`
					<div id="videoContainer"></div>
					<div id="otherStuff"></div>
					<div id="importantStuff"></div>
					<div class="clear"></div>
				`);

				/* Moving Stuff */
				$('#switch').detach().appendTo('#playerSwitchLightsOffContainer'); // Moves the Lights Off Switch in the playerSwitchLightsOffContainer element
				$('#centerDivVideo').detach().appendTo('#videoContainer'); // Moves the player container into a new container #videoContainer
				$('#selectEpisodeContainer, #playerSwitchLightsOffContainer, #divDownload, #divFileName, #redditThreadContainer').detach().appendTo('#otherStuff'); // Moves all the non player stuff into a new container #otherStuff
				$('#btnShowComments').parent().detach().appendTo('#otherStuff'); // Moves Comment button into #otherStuff
				$('#divComments').detach().appendTo('#otherStuff'); // Moves Comment container into #otherStuff

				/* Moves adsIfrme10 to another element temporarily so bigBarContainer can be removed without triggering the anti-Ad Blocker */
				$('#adsIfrme10').detach().appendTo('#importantStuff');
				setTimeout(function() {$("#adsIfrme10").remove();},5000);
				$('.bigBarContainer').remove();

				/* Removes useless stuff */
				$('a:contains("[ Back to top ]")').remove();
				$('#containerRoot .clear').slice(-3).remove();

				/* Inserts CSS file into head tag */
				$('head').inject('css', chrome.runtime.getURL('assets/css/rearrangeVideoPage.css'));

				/* Fix for Slimmer Header option */
				if (items.enableSlimHeader == true) $('#head + div').css('margin-bottom', '-127px');

				/* Sets custom video width */
				if (items.altVideoPageWidth) $('head').append(`<style>#videoContainer {width: ${items.altVideoPageWidth[0]}%}#otherStuff {width: ${items.altVideoPageWidth[1]}%}</style>`);
				// if (items.altVideoPageWidth) $('head').append('<style>#videoContainer {width: '+items.altVideoPageWidth[0]+'%} #otherStuff {width: '+items.altVideoPageWidth[1]+'%}</style>');

				/*  */
				setTimeout(function() {

					if (isHTML5) {

						var video_width = $('#my_video_1').width();

						var video_height = video_width / 1.767;

						// $('#my_video_1').style('height', video_height + 'px', 'important');
						$('#my_video_1').css('height', video_height);

						/* Autoplays the video after moving the player if the autoplay attr is set */
						if (document.getElementById('my_video_1_html5_api').hasAttribute('autoplay') == true) $('#my_video_1_html5_api').get(0).play();

						/* Layout messes up since window resize is triggered before the video is completely out of fullscreen. This will trigger the $(window).resize() again 100ms after the video is out of fullscreen. */
						$(document).on('webkitfullscreenchange', function() {
							if (!document.webkitIsFullScreen) setTimeout(function() { $(window).trigger('resize'); }, 100);
						});

					}

					/* Required for the comments box to resize correctly */
					$('#head').append('<div style="clear:both"></div>');

					/* Sets the height of the comment box */
					var content_height = $(document).height() - $('#head').height() - $('#headnav').outerHeight(true) - ( $('#otherStuff').height() - $('#btnShowComments').parent().height() ) - 25;

					$('#divComments').height(content_height + 'px');

					/* Fix for Comment Profile Pictures not loading when scrolling down */
					$('#divComments > div, #disqus_thread').height((content_height + 1) + 'px');

				}, 100);

				$(window).resize(function() {

					console.log('Window Resized');

					if (isHTML5) {

						var video_width = $('#my_video_1').width();
						var video_height = video_width / 1.775;
						/* $('#my_video_1').height(video_height + 'px'); */
						// $('#my_video_1').style('height', video_height + 'px', 'important');
						$('#my_video_1').css('height', video_height);

					} else if (isYTFlash) {

						var video_width = $('#embedVideo').width();
						var video_height = video_width / 1.775;
						$('#embedVideo').height(video_height + 'px');
						$('.fluid_width_video_wrapper').css({
							'height': video_height + 'px',
							'padding-top': '0px'
						});

					} else if (isIFrame) {

						var video_width = $('#divContentVideo iframe').width();
						var video_height = video_width / 1.775;
						$('#divContentVideo iframe').height(video_height + 'px');

					} else if ($('#divContentVideo_wrapper').length) {

						var video_width = $('#divContentVideo_wrapper').width();
						var video_height = video_width / 1.775;
						$('#divContentVideo_wrapper').height(video_height + 'px');

					}

					var content_height;

					$('#divComments').height(0);

					if ( $('#divComments').is(':visible') ) {
						content_height = $(document).height() - $('#head').height() - $('#headnav').outerHeight(true) - ($('#otherStuff').height() - $('#divComments').height()) - 10;
					}
					else {
						content_height = $(document).height() - $('#head').height() - $('#headnav').outerHeight(true) - ($('#otherStuff').height() - $('#btnShowComments').parent().height()) - 10;
					}
					$('#divComments').height(content_height + 'px');
					$('#divComments > div, #disqus_thread').css('height', (content_height + 1) + 'px');

					$('#videoContainer').resizable('option', 'maxWidth', ($(window).width() * 64) / 100);

				});

				$('#videoContainer').resizable({
					handles: 'e',
					minWidth: 560,
					maxWidth: ( $(window).width() * 64 ) / 100,
					resize: function(event, ui) {
						$('#otherStuff').width( 100 - ( $('#videoContainer').width() / $(window).width() ) * 100 - 2 + '%');
						$(ui.element).width( ($(ui.element).width() / $(window).width()) * 100 + '%' )
					},
					stop: function() {
						var videoWidth = ($('#videoContainer').width() / $(window).width()) * 100;
						var otherWidth = 100 - videoWidth - 2;
						chrome.storage.sync.set({altVideoPageWidth: [videoWidth, otherWidth]});
					}
				});

			}
		});

		///////////////////////////////////////////////////////
		// Remember Position for last video / time parameter //
		///////////////////////////////////////////////////////

		chrome.storage.sync.get('lastVideo', function(items) {
			/*
				[
					{
						animeTitle: "Anime Title",
						currentEpisode: "Episode 1",
						currentURL: "/Anime/AnimeTitle",
						currentTime: "100"
					}
				]
			*/
			/* if (items.lastVideo) { // already exist in storage
				var currentURL = window.location.href.replace(/(http|https):\/\/kissanime.to/g, '').replace(/&?s=([^&]$|[^&]*)/i, "").replace(/&?time=([^&]$|[^&]*)/i, "");
				$.each(items.lastVideo, function(index, obj) {
					if (obj.currentURL == currentURL) {
						if ( $('#my_video_1_html5_api').length ) {
							document.getElementById('my_video_1_html5_api').currentTime = obj.currentTime;
						} else if ( $('#embedVideo').length ) {

						}
						return false;
					}
				});
				$(window).on('beforeunload', function() {

				});
			} else { // doesn't exist in storage

			} */
			if (items.lastVideo) {
				var currentURL = window.location.href.replace(/(http|https):\/\/kissanime.ru/g, '').replace(/&?s=([^&]$|[^&]*)/i, "").replace(/&?time=([^&]$|[^&]*)/i, "");
				if ( currentURL == items.lastVideo[2] ) {
					if (isHTML5) {
						document.getElementById('my_video_1_html5_api').currentTime = items.lastVideo[3];
					} else if (isYTFlash) {
						var posInterval = setInterval(function() {
							try {
								if (document.getElementById('embedVideo').getPlayerState() == -1) {
									clearInterval(posInterval);
									document.getElementById('embedVideo').seekTo(items.lastVideo[3]);
									//console.log('Essentials for KissAnime: Remember Position - YouTube Player Loaded.');
								}
							} catch(e) {
								//console.log('Essentials for KissAnime: Remember Position - Waiting for YouTube Player...');
							}
						}, 250);
					}
					$(window).on("beforeunload", function() {
						var currentURL = window.location.href.replace(/(http|https):\/\/kissanime.ru/g, '').replace(/&?s=([^&]$|[^&]*)/i, "").replace(/&?time=([^&]$|[^&]*)/i, "");
						if (isHTML5) {
							if (document.getElementById('my_video_1_html5_api').duration - 40 < document.getElementById('my_video_1_html5_api').currentTime || document.getElementById('my_video_1_html5_api').ended == true) {
								chrome.storage.sync.remove('lastVideo');
							} else if (document.getElementById('my_video_1_html5_api').ended == false) {
								var currentTime = document.getElementById('my_video_1_html5_api').currentTime;
								var lastVideo = [AnimeTitle, currentEpisode, currentURL, currentTime];
								chrome.storage.sync.set({lastVideo:lastVideo});
							}
						} else if (isYTFlash) {
							if (document.getElementById('embedVideo').getDuration() - 40 < document.getElementById('embedVideo').getCurrentTime()) {
								chrome.storage.sync.remove('lastVideo');
							} else if (document.getElementById('embedVideo').getPlayerState() != 0) {
								var currentTime = document.getElementById('embedVideo').getCurrentTime();
								var lastVideo = [AnimeTitle, currentEpisode, currentURL, currentTime];
								chrome.storage.sync.set({lastVideo:lastVideo});
							} else {
								chrome.storage.sync.remove('lastVideo');
							}
						}
					});
				} else {
					$(window).on("beforeunload", function() {
						var currentURL = window.location.href.replace(/(http|https):\/\/kissanime.ru/g, '').replace(/&?s=([^&]$|[^&]*)/i, "").replace(/&?time=([^&]$|[^&]*)/i, "");
						if (isHTML5) {
							if (document.getElementById('my_video_1_html5_api').ended) {
								chrome.storage.sync.remove('lastvideo');
							} else {
								var currentTime = document.getElementById('my_video_1_html5_api').currentTime;
								var lastVideo = [AnimeTitle, currentEpisode, currentURL, currentTime];
								chrome.storage.sync.set({lastVideo:lastVideo});
							}
						} else if (isYTFlash) {
							if (document.getElementById('embedVideo').getPlayerState() == 0) {
								chrome.storage.sync.remove('lastvideo');
							} else {
								var currentTime = document.getElementById('embedVideo').getCurrentTime();
								var lastVideo = [AnimeTitle, currentEpisode, currentURL, currentTime];
								chrome.storage.sync.set({lastVideo:lastVideo});
							}
						}
					});
				}
			} else {
				$(window).on("beforeunload", function() {
					var currentURL = window.location.href.replace(/(http|https):\/\/kissanime.ru/g, '').replace(/&?s=([^&]$|[^&]*)/i, "").replace(/&?time=([^&]$|[^&]*)/i, "");
					var currentTime;
					if (isHTML5) currentTime = document.getElementById('my_video_1_html5_api').currentTime;
					else if (isYTFlash) currentTime = document.getElementById('embedVideo').getCurrentTime();
					var lastVideo = [AnimeTitle, currentEpisode, currentURL, currentTime];
					chrome.storage.sync.set({lastVideo:lastVideo});
				});
			}

			if (getUrlParameter('time')) {
				var time = getUrlParameter('time');
				if (isHTML5) {
					document.getElementById('my_video_1_html5_api').currentTime = time;
				} else if (isYTFlash) {
					var observer_timeParam = new MutationObserver(function(mutations) {
						mutations.forEach(function(mutation) {
							if ($('#embedVideo').attr('data-playerStatus') == '-1') {
								document.getElementById('embedVideo').seekTo(time);
								observer_timeParam.disconnect();
							}
						});
					});
					observer_timeParam.observe(document.querySelector('#embedVideo'), {attributes: true});
				}
				history.pushState('', document.title, window.location.href.replace(/&?time=([^&]$|[^&]*)/i, ""));
			}

		});

		/////////////////////
		// Remember Volume //
		/////////////////////

		chrome.storage.sync.get('volume', function(items) {
			if (items.volume) {
				if (isHTML5) {
					document.getElementById('my_video_1_html5_api').volume = items.volume;
				} else if (isYTFlash) {
					var observer_rememberVol = new MutationObserver(function(mutations) {
						mutations.forEach(function(mutation) {
							if ($('#embedVideo').attr('data-playerStatus') == '-1') {
								document.getElementById('embedVideo').setVolume(items.volume * 100);
								observer_rememberVol.disconnect();
							}
						});
					});
					observer_rememberVol.observe(document.querySelector('#embedVideo'), {attributes: true});
				}
				$(window).on("beforeunload", function() {
					if (isHTML5) {
						var volume = document.getElementById('my_video_1_html5_api').volume;
						chrome.storage.sync.set({volume:volume});
					} else if (isYTFlash) {
						var volume = document.getElementById('embedVideo').getVolume() / 100;
						chrome.storage.sync.set({volume:volume});
					}
				});
			} else {
				$(window).on("beforeunload", function() {
					if (isHTML5) {
						var volume = document.getElementById('my_video_1_html5_api').volume;
						chrome.storage.sync.set({volume:volume});
					} else if (isYTFlash) {
						var volume = document.getElementById('embedVideo').getVolume() / 100;
						chrome.storage.sync.set({volume:volume});
					}
				});
			}
		});

		///////////////////////
		// MyAnimeList Stuff //
		///////////////////////

		chrome.storage.local.get(['enableMALAPI', 'MALLoggedIn'], function(items) {

			if (items.enableMALAPI === true && items.MALLoggedIn === true) {

				toastr.options.positionClass = 'toast-top-center';
				toastr.options.timeOut = '0';
				toastr.options.extendedTimeOut = '0';
				toastr.options.preventDuplicates = false;
				toastr.options.target = '#my_video_1';
				var updateOptions = {timeOut: 10000, extendedTimeOut: 10000};

				var current = parseFloat(currentEpisode.split('Episode ', 3)[1]);
				var isEpisode = currentEpisode.indexOf('Episode') > -1;

				if (isEpisode && Number.isInteger(current)) {

					$.ajax({
						url: currentAnimeURL,
						success: function(data) {

							var AnimeTitle = $(data).find('.barContent > div > a.bigChar').text().replace('(Sub)', '').replace('(Dub)', '').trim();
							var AnimeTitles = [];

							$(data).find('span:contains("Other name:")').parent().find('a').each(function(index, entry) {
								AnimeTitles.push(entry.textContent);
							});

							AnimeTitles.unshift(AnimeTitle);

							chrome.runtime.sendMessage({
								MALv2: {
									type: 1,
									titles: AnimeTitles,
									path: window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))
								}
							}, function(response) {

								console.log(response);

								if (!response.success && response.error === 429) toastr.error(response.data, 'MyAnimelist Integration', { timeOut: "15000", extendedTimeOut: "15000", positionClass: "toast-top-right" });

								if (response.success) {

									var id = parseInt(response.data.mal.id);
									var inUserMAL = response.data.user ? true : false;
									var hasUpdated;

									console.log(inUserMAL);

									if (inUserMAL) {

										$('#navsubbar p').append(`
											| <span id="findinMALContainer" class="KEPad"></span>
											| <span style="padding: 0px 7px">
												<span>Episodes Watched:</span>
												<input type="number" id="episodesUserCurrentText" class="KETextInput" style="border: 1px solid white;" value="0" min="0">
												<span>/</span>
												<input type="text" id="episodesTotalText" class="KETextInput" disabled>
											</span>
											| <span style="padding: 0px 7px">
												<span id="scoreMALContainer" class="KEPad KEHide">
													<span>Your Score: </span>
													<select id="scoreDropdown" class="KEDropdown">
														<option value="0" selected>-</option>
														<option value="10">10</option>
														<option value="9">9</option>
														<option value="8">8</option>
														<option value="7">7</option>
														<option value="6">6</option>
														<option value="5">5</option>
														<option value="4">4</option>
														<option value="3">3</option>
														<option value="2">2</option>
														<option value="1">1</option>
													</select>
												</span>
											</span>
										`);

										$('#findinMALContainer').append(`<a href="http://myanimelist.net/anime/${id}" target="_blank">MAL Link</a>`);

										console.log(response);

										$('#episodesUserCurrentText').val(response.data.user.data.my_watched_episodes); // Adds the value for the Current Episode
										if (parseInt(response.data.user.data.series_episodes) !== 0) $('#episodesUserCurrentText').attr('max', response.data.user.data.series_episodes);
										$('#episodesTotalText').val(response.data.user.data.series_episodes); // Adds the value for the Total Episodes
										$('#scoreDropdown').val(response.data.user.data.my_score);

										var currentEpisodeValue;

										$('#episodesUserCurrentText').on('focus', function() {
											currentEpiValue = this.value;
											$(this).animate({'width': '40px'});
										});

										/* == Update Episode == */
										$('#episodesUserCurrentText').on('blur', function() {

											$(this).animate({'width': '25px'});

											if (currentEpisodeValue != this.value) {

												chrome.runtime.sendMessage({ MALv2: { type: 4, id: id, episode: this.value } }, function(response) {

													console.log('Episode Status:', response);

													if (response.success) {
														toastr['success']('Episode Updated!', '', updateOptions);
														hasUpdated = true;
													} else toastr['error'](response.data);

												});

											}

										});

										/* == User's MAL Score Dropdown == */
										$('#scoreDropdown').on('change', function() {

											chrome.runtime.sendMessage({ MALv2: { type: 6, id: id, score: this.value } }, function(response) {

												console.log('Score Status:', response);

												if (response.success) toastr['success']('Score successfully updated!', '', updateOptions);
												else toastr['error']('An error has occured!', '', updateOptions);

											});

										});

										var watchedEpisodes = parseInt(response.data.user.data.my_watched_episodes);

										if (parseInt(response.data.user.data.my_status) !== 2 && watchedEpisodes < current && current <= $('#selectEpisode option').length) {

											$('#navsubbar p').append('<span id="countDownContainer">| <span style="padding: 0px 7px">Time until update: <span id="countDown">N/A</span></span></span>');

											hasUpdated = false;
											var offset;

											if (isHTML5) {

												var player = document.getElementById('my_video_1_html5_api');

												if (player.duration < 300) offset = 60;
												else offset = 180;

												var countDown = setInterval(function() {

													var countDownSeconds = Math.floor(player.duration - player.currentTime - offset);
													countDownSeconds--;

													if (countDownSeconds < 0) {
														clearInterval(countDown);
														doConfirmation();
														$('#countDownContainer').remove();
													} else {
														$('#countDown').text(getTime(countDownSeconds));
													}

												}, 250);

												$('#my_video_1_html5_api').unbind('ended').on('ended', function() {

													storage.sync.get('enableAutoAdvEp', function(items) {

														toastr.remove();

														if (items.enableAutoAdvEp === true && $('#selectEpisode option:selected').next().length) {
															toastr.options.timeOut = '15000';
															toastr.options.extendedTimeOut = '15000';
															toastr.options.onHidden = function() { $('#btnNext').click(); }
														}

														doConfirmation(items.enableAutoAdvEp);

														clearInterval(countDown);

														$('#countDownContainer').remove();

													});

												});

											}

											function doConfirmation(enableAutoAdvEp) {

												//clearInterval(updateInterval);

												if (hasUpdated == false) {

													toastr['info'](`<div style="margin-bottom:5px">Update episode number from ${watchedEpisodes} to ${current}?</div><button type="button" class="updateEpisode btn">Update</button>&nbsp;<button type="button" class="cancelUpdate btn">Cancel</button>`, 'Update MyAnimeList?');

													$('.updateEpisode').click(function() {

														chrome.runtime.sendMessage({ MALv2: { type: 4, id: id, episode: current } }, function(response) {

															console.log('Episode Status:', response);

															if (response.success) {
																hasUpdated = true;
																toastr['success']('Episode Updated!', '', updateOptions);
																$('#episodesUserCurrentText').val(current);
															} else toastr['error'](response.data);

														});

													});

												} else {

													if (enableAutoAdvEp === true) $('#btnNext').click();

												}

											}

											function getTime(seconds) {
												var a = Math.floor(seconds / 60);
												var b = Math.floor(seconds % 60);
												if (b < 10) b = '0' + b;
												return a+':'+b;
											}

										}

									}

								}

							});

						}
					});

				}

			}

		});

		////////////////
		// ScrollView //
		////////////////

		$.fn.scrollView = function (offset) {
			var top;
			return this.each(function () {
				if (offset) top = $(this).offset().top + offset;
				else top = $(this).offset().top;
				$('html, body').stop().animate({
					scrollTop: top
				}, 1000);
			});
		}

		///////////////////////////
		// Scrolls down to video //
		///////////////////////////

		chrome.storage.sync.get([
			'enableAds',
			'enableVideoPageAds',
			'enableAutoFullscreen',
			'enableAltVideoPage'
		], function(items) {
			if (items.enableAutoFullscreen == false || items.enableAltVideoPage == false) {
				if (items.enableAds == false || items.enableVideoPageAds == false) {
					// $('#selectEpisodeContainer').scrollView();
				} else {
					// $('#playerSwitchLightsOffContainer').scrollView(-30);
				}
			}
		});

		// Disables the YouTube Player's built in Keyboard Shortcuts //
		$('#embedVideo').attr('src', $('#embedVideo').attr('src') + '&disablekb=1');

		////////////////////////
		// Keyboard Shortcuts //
		///////////////////////////////////////////////////////
		// Used Mousetrap from https://craig.is/killing/mice //
		///////////////////////////////////////////////////////

		// Used to set Status Text. //
		var statusTimeout;
		function setStatusText(text, clear, timeout) {
			if (timeout == true) clearTimeout(statusTimeout);
			$('#status').html(text);
			$('#status').fadeIn(250, function() {
				if (clear) statusTimeout = setTimeout(function() {
					$('#status').fadeOut(250, function() {
						$('#status').html("")
					});
				}, clear);
			});
		}

		/////////////////////////////////
		// Creates Status Text Element //
		/////////////////////////////////

		setTimeout(function() {
			if (isHTML5) $('#my_video_1').prepend('<div id="status"></div>');
			else if (isYTFlash) $('#divContentVideo').prepend('<div id="status"></div>');
			else if ($('#divContentVideo_wrapper').length) $('#divContentVideo_wrapper').prepend('<div id="status"></div>');

			$('#status').css({
				"display": "none",
				"position": "absolute",
				"top": "5px",
				"font-size": "23px",
				"z-index": "1",
				"color": "white",
				"left": "7px",
				"text-shadow": "1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,0px 1px 0 #000,1px 0px 0 #000,0px -1px 0 #000,-1px 0px 0 #000",
				"background": "rgba(0,0,0,0.4)",
				"letting-spacing": "1px",
				"box-shadow": "0 0 15px 10px rgba(0,0,0,0.4)",
				"font-family": "monospace",
				"pointer-events": "none"
			});
		}, 1000);

		if ($('#centerDivVideo').length) {
			chrome.storage.sync.get(function(items) {
				if (items.enableKeyboardShortcuts == true) {

					var efka = {}; // Namespace for shortcut functions //

					// Unbinds the default HTML5 shortcuts since I want the extension to handle all shortcuts.
					$('body').inject('inline-script', function() {
						videojs('my_video_1').ready(function() {
							this.off('keydown');
						});
					});

					 // Default Shortcuts if no custom shortcut is set //
					var KeyboardShortcuts = {
						"Open": ["h", "/"],
						"Fullscreen": "f",
						"Lights": "l",
						"PlayPause": "p",
						"VolUp": "up",
						"VolDown": "down",
						"SeekForward": "right",
						"SeekBack": "left",
						"Previous": "b",
						"Next": "n",
						"Comments": "c",
						"Reload": "r",
						"Information": "i",
						"Skip": "s",
						"Advance": "a",
						"PlaybackRateUp": ["=", "+"],
						"PlaybackRateDown": "-",
						/*
						Default Shortcuts Reference. When unbinding a key, the shortcut will
						revert to the default shortcut.
						*/
						"DEFAULTS": {
							"Open": ["h", "/"],
							"Fullscreen": "f",
							"Lights": "l",
							"PlayPause": "p",
							"VolUp": "up",
							"VolDown": "down",
							"SeekForward": "right",
							"SeekBack": "left",
							"Previous": "b",
							"Next": "n",
							"Comments": "c",
							"Reload": "r",
							"Information": "i",
							"Skip": "s",
							"Advance": "a",
							"PlaybackRateUp": ["=", "+"],
							"PlaybackRateDown": "-"
						}
					};

					// Overwrites the default shortcuts with the ones in chrome.storage. //
					if (items.keyboardShortcuts) {
						$.each(items.keyboardShortcuts, function(index, value) {
							KeyboardShortcuts[index] = value;
						});
					}

					if ($('#my_video_1_html5_api').length) {
						// $('.ccmVJSControls').after('<div class="option ccmHideStatus" style="border-bottom: 1px dotted grey">Hide KS Status Text</div>');
						$('.ccmVJSControls').after('<div class="option ccmHideStatus">Hide KS Status Text</div>');
						$('.ccmHideStatus').click(function() {
							if ($(this).hasClass('active')) {
								$(this).removeClass('active');
								$('#statusHide').remove();
							} else {
								$(this).addClass('active');
								$('head').append('<style id="statusHide">#status {display:none !important}</style>');
							}
						});
					}

					/////////////////////
					// Help Dialog Box //
					/////////////////////
					var KeyboardShortcutsHTML = chrome.runtime.getURL('/InjectedHTML/KeyboardShortcuts.html');
					$('#containerRoot').prepend('<div id="KBSHelpHTML"></div>');
					$('#KBSHelpHTML').load(KeyboardShortcutsHTML, function() {

						$('.shortcutText').each(function(index, value) {
							$(value).text( (KeyboardShortcuts[$(value).attr('data-shortcut')]).toUpperCase() );
						}).click(function(e) {
							var _this = $(this);
							var shortcut = $(this).attr('data-shortcut');
							_this.css('color', 'yellow');

							Mousetrap.record(function(a) {

								console.log(a);
								if ( checkKeys(KeyboardShortcuts, a[0]) == 1 ) {

									toastr['error']('Shortcut already binded!', '', {timeOut: 5000, extendedTimeOut: 5000, preventDuplicates: true});
									_this.css('color', 'white');

								} else if ( checkKeys(KeyboardShortcuts, a[0]) == 2 ) {

									toastr['error']('This key is reserved!<br>Cannot bind shortcut to this key!', '', {timeOut: 5000, extendedTimeOut: 5000, preventDuplicates: true});
									_this.css('color', 'white');

								} else if ( checkKeys(KeyboardShortcuts, a[0]) == 3 ) {

									toastr['info']('Cleared Shortcut!<br>Reverted to default.', '', {timeOut: 5000, extendedTimeOut: 5000, preventDuplicates: true});
									Mousetrap.unbind(KeyboardShortcuts[shortcut]);
									chrome.storage.sync.get('keyboardShortcuts', function(items) {
										if (items.keyboardShortcuts) {
											delete items.keyboardShortcuts[shortcut];
											chrome.storage.sync.set({keyboardShortcuts: items.keyboardShortcuts});
										}
									});
									KeyboardShortcuts[shortcut] = KeyboardShortcuts.DEFAULTS[shortcut];
									Mousetrap.bind(KeyboardShortcuts[shortcut], efka['do_'+shortcut+'_Shortcut']);
									_this.text( KeyboardShortcuts[shortcut].toUpperCase() ).css( 'color', 'white' );

								} else if ( checkKeys(KeyboardShortcuts, a[0]) == 4 ) {

									toastr['info']('Canceled Key Recording!', '', {timeOut: 3000, extendedTimeOut: 3000, preventDuplicates: true});
									_this.css('color', 'white');

								} else if ( checkKeys(KeyboardShortcuts, a[0]) == 5 ) {
									toastr['error']('Function Keys cannot be binded!', '', {timeOut: 5000, extendedTimeOut: 5000, preventDuplicates: true});
									_this.css('color', 'white');

								} else {
									if ( a[0] != undefined ) {
										console.log(a[0]);
										_this.text( a[0].toUpperCase() ).css('color', 'white');
										Mousetrap.unbind(KeyboardShortcuts[shortcut]); // Unbinds the previous Key
										chrome.storage.sync.get('keyboardShortcuts', function(items) {
											if (!items.keyboardShortcuts) {
												var newCustShortcuts = {};
												newCustShortcuts[shortcut] = a[0];
												chrome.storage.sync.set({keyboardShortcuts: newCustShortcuts});
											} else {
												if (a[0] == KeyboardShortcuts.DEFAULTS[shortcut]) {
													delete items.keyboardShortcuts[shortcut];
													chrome.storage.sync.set({keyboardShortcuts: items.keyboardShortcuts});
												} else {
													items.keyboardShortcuts[shortcut] = a[0];
													chrome.storage.sync.set({keyboardShortcuts: items.keyboardShortcuts});
												}
											}
										});

										KeyboardShortcuts[shortcut] = a[0]; // Saves the new Key in Keyboard Shortcuts Object
										Mousetrap.bind(KeyboardShortcuts[shortcut], efka['do_'+shortcut+'_Shortcut']);
									} else {
										_this.css('color', 'white');
									}

								}

							});

							event.preventDefault();
						});

						/*
						undefined = Key not binded
						1 = Key already binded
						2 = Key is reserved
						3 = Backspace
						4 = Escape
						5 = Function Key
						Note: For now keys '-', '=', and '+' will not be allowed to use. This will most likely change
						later once I add the option to rebind the 'Playback Rate Up' and 'Playback Rate Down' shortcuts.
						*/

						function checkKeys(a, b) {
							for (var k in a) {
								if (!a.hasOwnProperty(k)) continue;
								if (Array.isArray(a[k])) {
									for (var i = 0; i < a[k].length; i++) {
										if (b === 'h' || b === '/' || b == '-' || b == '=' || b == '+' || b == 'space') return 2;
										else if (a[k][i] === 'backspace') return 3;
										else if (a[k][i] === 'esc') return 4;
										else if ( /[F]\d/g.test(a[k][i]) ) return 5;
										else if (a[k][i] === b) return 1;
									}
								} else {
									if (b === 'h' || b === '/' || b == '-' || b == '=' || b == '+' || b == 'space') return 2;
									else if (b === 'backspace') return 3;
									else if (b === 'esc') return 4;
									else if ( /[f]\d/g.test(b) ) return 5;
									else if ( a[k] === b ) return 1;
								}
							}
						}

						function checkConflicts(a, b) {
							var conflicts = [], noconflicts = [];
							for (var k in a) {
								if ( a.hasOwnProperty(k) ) {
									if (a[k] == b) conflicts.push(k);
									else noconflicts.push(k);
								}
							}
							if (conflicts.length > 1) return {conflicts: conflicts, noconflicts: noconflicts};
							return {noconflicts: noconflicts};
						}

						chrome.storage.sync.get('keyshortcuts_help', function(items) {
							document.getElementById('keyshortcuts_help').checked = items.keyshortcuts_help;
						});

						Mousetrap.bind(KeyboardShortcuts['Open'], function() {
							console.debug(KeyboardShortcuts);
							$("#help_box").dialog({
								appendTo: "#container", show: {effect: "blind", duration: 300}, hide: {effect: "blind", duration: 300}, width: "550", resizable: false, position: { my: "center", at: "center", of: window },
								close: function() {
									Mousetrap.stopRecord();
									Mousetrap.bind(KeyboardShortcuts['Open'], function() {
										$('#help_box').dialog('open');
										console.debug(KeyboardShortcuts);
									});
								},
								open: function() {
									Mousetrap.bind(KeyboardShortcuts['Open'], function() {
										$('#help_box').dialog('close');
									});
								},
							});
							$('.ui-button-text').hide();
						});

						$(document).on('click', '#keyshortcuts_help', function() {
							var keyshortcuts_help = document.getElementById('keyshortcuts_help').checked;
							chrome.storage.sync.set({keyshortcuts_help:keyshortcuts_help});
						});

						// Sets the inputmask //
						$("#skipTimeInput").inputmask("99:99");

						// Sets the default SkipTime to 1 minute and 25 seconds //
						chrome.storage.sync.get('skipTime', function(items) {
							if (!items.skipTime) {
								chrome.storage.sync.set({skipTime: '01:25'});
								$('#skipTimeInput').val('01:25');
								console.log('Default Skip Time Set');
							} else {
								$('#skipTimeInput').val(items.skipTime);
							}
						});

						// Saves new SkipTime //
						$('#saveSkipTime').click(function() {
							var saveTime = $('#skipTimeInput').val();
							chrome.storage.sync.set({skipTime: saveTime});
							toastr['success']('Skip Time Saved!');
						});

						// Sets the inputmask //
						$("#advTimeInput").inputmask("99:99");

						// Sets the default AdvanceTime to 30 seconds //
						chrome.storage.sync.get('advanceTime', function(items) {
							if (!items.advanceTime) {
								chrome.storage.sync.set({advanceTime: '00:30'});
								$('#advTimeInput').val('00:30');
								console.log('Default Advance Time Set');
							} else {
								$('#advTimeInput').val(items.advanceTime);
							}
						});

						// Saves new SkipTime //
						$('#saveadvTime').click(function() {
							// Checks to see if time is Valid before saving //
							var saveTime = $('#advTimeInput').val();
							chrome.storage.sync.set({advanceTime: saveTime});
							toastr['success']('Advance Time Saved!');

						});

					});

					// Timeout is so the JWPLAYER can load for videos that still use it //
					setTimeout(function() {

						if ($('#divContentVideo_wrapper').length) {
							setStatusText('Keyboard Shortcuts is not supported with the JWPlayer. Please switch to the HTML5 player if you wish to use Keyboard Shortcuts.', 5000);
						}

						chrome.storage.sync.get('keyshortcuts_help', function(items) {
							if (items.keyshortcuts_help == false || items.keyshortcuts_help == null) {
								if (!$('#divContentVideo_wrapper').length) {
									setStatusText('Keyboard Shortcuts Enabled. Press '+KeyboardShortcuts['Open'].map(function(x){return x.toUpperCase()}).join(' or ')+' on the Keyboard for a list of Shortcuts.', 5000);
								}
							}
						});

						///////////////////////////
						// All Players Shortcuts //
						///////////////////////////

						////////////////
						// Lights Off //
						////////////////

						efka['do_Lights_Shortcut'] = function() {
							if ($('#lightsofflayer').length == 0) {
								$('body').append('<div id="lightsofflayer" style="height:100%;width:100%;background-color:black;opacity: 0.9;;z-index:11;position:fixed;top:0px;display:none;"></div>');
								$('#lightsofflayer').fadeToggle();
								$('#centerDivVideo').css('z-index','12');
								$('#lightsofflayer').click(function() {
									$('#lightsofflayer').fadeToggle(function() {
										$('#lightsofflayer').remove();
									});
								});
							} else if ($('#lightsofflayer').length != 0) {
								$('#lightsofflayer').fadeToggle(function() {
									$('#lightsofflayer').remove();
								});
							}
						};

						Mousetrap.bind(KeyboardShortcuts['Lights'], efka.do_Lights_Shortcut);

						/////////////////////
						// Comment Section //
						/////////////////////

						efka['do_Comments_Shortcut'] = function() {
							if ($('iframe[title="Disqus"]').length == 0) {
								var disqus_shortname = 'kissanime';
								(function () {
									var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
									dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
									(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
								})();
								$('#divComments').show();
								$('#btnShowComments').parent().fadeToggle();
								setTimeout(function() {
									$('#divComments').scrollView();
								}, 1000);
							} else if ($('#divComments').is(':hidden')) {
								$('#divComments').slideToggle(1000);
								$('#btnShowComments').parent().fadeToggle();
								setTimeout(function() {$('#divComments').scrollView();}, 700);
							} else if ($('#divComments').is(':visible')) {
								$('#divComments').slideToggle(1000);
								setTimeout(function() {
									$('#btnShowComments').parent().fadeToggle();
								}, 1000);
								chrome.storage.sync.get('enableAutoFullscreen', function(items) {
									if (items.enableAutoFullscreen) $('#my_video_1').scrollView();
									else $('.barContent').scrollView();

								})
							}
						};

						Mousetrap.bind(KeyboardShortcuts['Comments'], efka.do_Comments_Shortcut);

						///////////////////////////
						// Display Episode Info //
						//////////////////////////

						// http://stackoverflow.com/questions/5612787/converting-an-object-to-a-string#answer-5612876 //
						// Slightly changed //
						function objToString (obj) {
							var str = '';
							for (var p in obj) {
								if (obj.hasOwnProperty(p)) {
									str += p + ': ' + obj[p] + '<div style="height:5px"></div>';
								}
							}
							return str;
						}

						efka['do_Information_Shorcut'] = function() {
							var info = {};
							info['Currently Playing'] = AnimeTitle+' '+currentEpisode;
							info['Video Host'] = window.videohost;
							if ($('#my_video_1_html5_api').length) {
								var video = $('#my_video_1_html5_api')[0];
								var networkState = ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'];
								info['Player Dimensions'] = $('#my_video_1').width()+'x'+$('#my_video_1').height();
								info['Quality'] = $('.selectQuality option:selected').text();
								info['Volume'] = (video.volume * 100).toFixed(2) + '%';
								info['Playback Rate'] = video.playbackRate + 'x';
								info['Network State'] = networkState[video.networkState];
								info['Buffered'] = video.buffered.end(video.buffered.length-1) + '/' + video.duration;
								info['URL Expiration Date'] = getExpireDate();
							} else if ($('#embedVideo').length) {
								var video = $('#embedVideo')[0];
								info['Player Dimensions'] = $('#embedVideo').width()+'x'+$('#embedVideo').height();
								info['Quality'] = video.getPlaybackQuality();
								info['Volume'] = video.getVolume();
							}
							if ($('html')[0].hasAttribute('data-existinusermal') == true) {
								info["Exists In User's MAL"] = $('html').attr('data-existinusermal');
								info['MAL ID'] = $('html').attr('data-MALID');
							}
							setStatusText('<div style="font-size:15px">'+objToString(info)+'</div>', 6000, true);
						};

						Mousetrap.bind(KeyboardShortcuts['Information'], efka.do_Information_Shorcut);

						//////////////////////
						// Previous Episode //
						//////////////////////

						efka['do_Previous_Shortcut'] = function() {
							$('#btnPrevious').click();
						};

						Mousetrap.bind(KeyboardShortcuts['Previous'], efka.do_Previous_Shortcut);

						//////////////////
						// Next Episode //
						//////////////////

						efka['do_Next_Shortcut'] = function() {
							$('#btnNext').click();
						};

						Mousetrap.bind(KeyboardShortcuts['Next'], efka.do_Next_Shortcut);

						////////////////////////////
						// HTML5 Player Shortcuts //
						////////////////////////////

						if ($('#my_video_1_html5_api').length) {
							console.log('%cEssentials for KissAnime: HTML5 Player is Active', 'color:blue');
							console.log('%cEssentials for KissAnime: Keyboard Shortcuts Enabled', 'color:blue');

							var video = document.getElementById('my_video_1_html5_api');
							var videoContainer = $('#my_video_1');
							var currentvol;

							////////////////
							// Fullscreen //
							////////////////

							efka['do_Fullscreen_Shortcut'] = function() {
								if (items.enableAutoFullscreen == false) {
									$('.vjs-fullscreen-control').click();
								}
							};

							Mousetrap.bind(KeyboardShortcuts['Fullscreen'], efka.do_Fullscreen_Shortcut);

							////////////////
							// Play/Pause //
							////////////////

							efka['do_PlayPause_Shortcut'] = function() {
								video.paused ? video.play() : video.pause();
							}

							Mousetrap.bind(KeyboardShortcuts['PlayPause'], efka.do_PlayPause_Shortcut);

							Mousetrap.bind('space', function() {
								if ( videoContainer.is(':focus') ) {
									video.paused ? video.play() : video.pause();
									event.preventDefault();
								}
							});


							video.addEventListener('pause', function() {
								setStatusText("Paused", 3000, true);
							});

							video.addEventListener('play', function() {
								setStatusText("Playing", 3000, true);
							});

							///////////////
							// Volume Up //
							///////////////

							efka['do_VolUp_Shortcut'] = function() {
								currentvol = video.volume;
								if (!video.paused && currentvol < 1) {
									if (currentvol > 0.95 && currentvol < 1) {
										currentvol = 1;
										video.volume = 1;
									} else {
										currentvol = +((currentvol+=0.05).toFixed(2));
										video.volume = currentvol;
									}
									event.preventDefault();
								}
							};

							Mousetrap.bind(KeyboardShortcuts['VolUp'], efka.do_VolUp_Shortcut);

							/////////////////
							// Volume Down //
							/////////////////

							efka['do_VolDown_Shortcut'] = function() {
								currentvol = video.volume;
								if (!video.paused && currentvol > 0) {
									if (currentvol < 0.05 && currentvol > 0) {
										currentvol = 0;
										video.volume = 0;
									} else {
										currentvol = +((currentvol-=0.05).toFixed(2));
										video.volume = currentvol;
									}
									event.preventDefault();
								}
							};

							Mousetrap.bind(KeyboardShortcuts['VolDown'], efka.do_VolDown_Shortcut);

							video.addEventListener('volumechange', function() {
								currentvol = video.volume;
								if (!video.muted) setStatusText("Volume: "+Math.round(currentvol * 100), 3000, true);
							});

							//////////////////
							// Seek Forward //
							//////////////////

							efka['do_SeekForward_Shortcut'] = function() {
								video.currentTime += 3;
							};

							Mousetrap.bind(KeyboardShortcuts['SeekForward'], efka.do_SeekForward_Shortcut);

							///////////////
							// Seek Back //
							///////////////

							efka['do_SeekBack_Shortcut'] = function() {
								video.currentTime -= 3;
							};

							Mousetrap.bind(KeyboardShortcuts['SeekBack'], efka.do_SeekBack_Shortcut);

							//////////
							// Mute //
							//////////
							/* Mousetrap.bind('m', function() {
								if (!videoContainer.is(':focus')) {
									if (video.muted) {
										video.muted = false;
										setStatusText("Volume: " + Math.round(video.volume * 100), 3000, true);
									} else {
										video.muted = true;
										setStatusText("Volume: Muted", 3000, true);
									}
								} else if (videoContainer.is(':focus')) {
									if (video.muted) {
										setStatusText("Volume: Muted", 3000, true);
									} else {
										setStatusText("Volume: " + Math.round(video.volume * 100), 3000, true);
									}
								}
							}); */

							////////////////////////////////////////
							// Displays current time when seeking //
							////////////////////////////////////////
							video.addEventListener("seeking", function() {
								var currentTime = video.currentTime;
								var totalTime = video.duration;

								var currentMinutes = Math.floor(currentTime / 60);
								var currentSeconds = Math.floor(currentTime % 60);

								if (currentMinutes < 10) currentMinutes = '0' + currentMinutes;
								if (currentSeconds < 10) currentSeconds = '0' + currentSeconds;

								var totalMinutes = Math.floor(totalTime / 60);
								var totalSeconds = Math.floor(totalTime % 60);

								if (totalMinutes < 10) totalMinutes = '0' + totalMinutes;
								if (totalSeconds < 10) totalSeconds = '0' + totalSeconds;

								setStatusText(currentMinutes+':'+currentSeconds+' / '+totalMinutes+':'+totalSeconds, 3000, true);
							});

							//////////////////
							// Reload Video //
							//////////////////

							efka['do_Reload_Shortcut'] = function() {
								var currentTime = video.currentTime;
								video.load();
								video.currentTime = currentTime;
							};

							Mousetrap.bind(KeyboardShortcuts['Reload'], efka.do_Reload_Shortcut);

							///////////////////////////////
							// Auto Skip to certain time //
							///////////////////////////////

							efka['do_Skip_Shortcut'] = function() {
								chrome.storage.sync.get('skipTime', function(items) {
									var storageTime = items.skipTime;
									var time = parseInt(storageTime.split(':')[0]) * 60 + parseInt(storageTime.split(':')[1]);
									video.currentTime = time;
								});
							};

							Mousetrap.bind(KeyboardShortcuts['Skip'], efka.do_Skip_Shortcut);

							////////////////////////////
							// Advance certain amount //
							////////////////////////////

							efka['do_Advance_Shortcut'] = function() {
								chrome.storage.sync.get('advanceTime', function(items) {
									var storageTime = items.advanceTime;
									var time = parseInt(storageTime.split(':')[0]) * 60 + parseInt(storageTime.split(':')[1]);
									video.currentTime = video.currentTime + time;

								});
							};

							Mousetrap.bind(KeyboardShortcuts['Advance'], efka.do_Advance_Shortcut);

							//
							//
							//

							if (items.enableKeyboardShortcuts == true) {

								efka['do_PlaybackRateUp_Shortcut'] = function () {
									$('#playbackRateSlider').slider('value', $('#playbackRateSlider').slider('value') + 0.05);
									setStatusText('Playback Rate: ' + $('#playbackRateSlider').slider('value') + 'x', 3000, true);
								};

								Mousetrap.bind(KeyboardShortcuts['PlaybackRateUp'], efka.do_PlaybackRateUp_Shortcut);

								efka['do_PlaybackRateDown_Shortcut'] = function () {
									$('#playbackRateSlider').slider('value', $('#playbackRateSlider').slider('value') - 0.05);
									setStatusText('Playback Rate: ' + $('#playbackRateSlider').slider('value') + 'x', 3000, true);
								};

								Mousetrap.bind(KeyboardShortcuts['PlaybackRateDown'], efka.do_PlaybackRateDown_Shortcut);

							}


							$("#my_video_1_html5_api").on('mousewheel', function(event, delta) {

								currentvol = video.volume;
								if (!video.paused) {
									if (delta == -1) {
										if (currentvol > 0) {
											if (currentvol < 0.05 && currentvol > 0) {
												currentvol = 0;
												video.volume = 0;
											} else {
												currentvol = +((currentvol-=0.05).toFixed(2));
												video.volume = currentvol;
											}
										}
									} else if (delta == 1) {
										if (currentvol < 1) {
											if (currentvol > 0.95 && currentvol < 1) {
												currentvol = 1;
												video.volume = 1;
											} else {
												currentvol = +((currentvol+=0.05).toFixed(2));
												video.volume = currentvol;
											}
										}
									}
									event.preventDefault();
								}
							});

						}

						//////////////////////////////
						// YouTube Player Shortcuts //
						//////////////////////////////

						if ($('#embedVideo').length) {
							console.log('%cEssentials for KissAnime: YouTube Player is Active', 'color:blue');
							console.log('%cEssentials for KissAnime: Keyboard Shortcuts Enabled', 'color:blue');
							console.log('%cEssentials for KissAnime: Due to restrictions in the YouTube Player, shortcuts will not work in native fullscreen!', 'color:red');

							var video = document.getElementById('embedVideo');
							var videoContainer = $('#divContentVideo');
							var currentvol;

							////////////////
							// Play/Pause //
							////////////////

							efka['do_PlayPause_Shortcut'] = function() {
								if (video.getPlayerState() == 1) {
									video.pauseVideo();
									setStatusText('Paused', 3000, true);
								} else if (video.getPlayerState() == 2) {
									video.playVideo();
									setStatusText('Playing', 3000, true);
								}
							};

							Mousetrap.bind(KeyboardShortcuts['PlayPause'], efka.do_PlayPause_Shortcut);

							var observer_status = new MutationObserver(function(mutations) {
								switch($('#embedVideo').attr('data-playerStatus')){
									case '1':
										setStatusText("Playing", 3000, true);
										break;
									case '2':
										setStatusText("Paused", 3000, true);
										break;
								}
							});
							observer_status.observe(document.querySelector('#embedVideo'), {attributes: true});

							///////////////
							// Volume Up //
							///////////////

							efka['do_VolUp_Shortcut'] = function() {
								currentvol = video.getVolume();
								if (!videoContainer.is(':focus') && video.getPlayerState() != 2 && currentvol < 100) {
									if (currentvol > 95 && currentvol < 1) {
										currentvol = 100;
										video.setVolume(100);
										setStatusText('Volume: ' + currentvol, 3000, true);
										event.preventDefault();
									} else {
										currentvol = Math.round(currentvol+=5);
										video.setVolume(currentvol);
										setStatusText('Volume: ' + currentvol, 3000, true);
										event.preventDefault();
									}
								}
							};

							Mousetrap.bind(KeyboardShortcuts['VolUp'], efka.do_VolUp_Shortcut);

							/////////////////
							// Volume Down //
							/////////////////

							efka['do_VolDown_Shortcut'] = function() {
								currentvol = video.getVolume();
								if (!videoContainer.is(':focus') && video.getPlayerState() != 2 && currentvol > 0) {
									if (currentvol > 0 && currentvol < 5) {
										currentvol = 0;
										video.setVolume(0);
										setStatusText('Volume: ' + currentvol, 3000, true);
										event.preventDefault();
									} else {
										currentvol = Math.round(currentvol-=5);
										video.setVolume(currentvol);
										setStatusText('Volume: ' + currentvol, 3000, true);
										event.preventDefault();
									}
								}
							};

							Mousetrap.bind(KeyboardShortcuts['VolDown'], efka.do_VolDown_Shortcut);

							///////////////
							// Seek Back //
							///////////////

							efka['do_SeekBack_Shortcut'] = function() {
								if (!videoContainer.is(':focus')) {
									video.seekTo(video.getCurrentTime() - 2);
								}
							};

							Mousetrap.bind(KeyboardShortcuts['SeekBack'], efka.do_SeekBack_Shortcut);

							//////////////////
							// Seek Forward //
							//////////////////

							efka['do_SeekForward_Shortcut'] = function() {
								if (!videoContainer.is(':focus')) {
									video.seekTo(video.getCurrentTime() + 2);
								}
							};

							Mousetrap.bind(KeyboardShortcuts['SeekForward'], efka.do_SeekForward_Shortcut);

							//////////
							// Mute //
							//////////
							/* Mousetrap.bind('m', function() {
								if (video.isMuted() == true) {
									video.unMute();
									setStatusText('Volume: ' + video.getVolume(), 3000, true);
								} else {
									video.mute();
									setStatusText('Volume: Muted', 3000, true);
								}
							}); */

							///////////////////////////////
							// Auto Skip to certain time //
							///////////////////////////////

							efka['do_Skip_Shortcut'] = function() {
								chrome.storage.sync.get('skipTime', function(items) {
									var storageTime = items.skipTime;
									var time = parseInt(storageTime.split(':')[0]) * 60 + parseInt(storageTime.split(':')[1]);
									video.seekTo(time);
								});
							};

							Mousetrap.bind(KeyboardShortcuts['Skip'], efka.do_Skip_Shortcut);

							////////////////////////////
							// Advance certain amount //
							////////////////////////////

							efka['do_Advance_Shortcut'] = function() {
								chrome.storage.sync.get('advanceTime', function(items) {
									var storageTime = items.advanceTime;
									var time = parseInt(storageTime.split(':')[0]) * 60 + parseInt(storageTime.split(':')[1]);
									video.seekTo(video.getCurrentTime() + time);

								});
							};

							Mousetrap.bind(KeyboardShortcuts['Advance'], efka.do_Advance_Shortcut);

						}

					}, 1500);
				}
			});
		}

	}

});
