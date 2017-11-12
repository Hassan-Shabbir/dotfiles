// STILL NEEDS BE LOOKED OVER //

// Sets up toastr //
toastr.options = {
	"closeButton": false,
	"debug": false,
	"newestOnTop": false,
	"progressBar": true,
	"positionClass": "toast-bottom-center",
	"preventDuplicates": true,
	"onclick": null,
	"showDuration": "fast",
	"hideDuration": "fast",
	"timeOut": "5000",
	"extendedTimeOut": "5000",
	"showEasing": "linear",
	"hideEasing": "linear",
	"showMethod": "fadeIn",
	"hideMethod": "fadeOut"
};

// Foolproof way of making sure the user doesn't leave a forward slash at the end of the url for whatever reason. Not really. Just don't want to bother with finding a better solution.
if (window.location.pathname.slice(-1) === '/') window.location = window.location.href.slice(0, -1);

if (/^\/Anime\/([^\/$]*)$/.test(window.location.pathname) || /^\/Anime\/([^\/$]*)\/$/.test(window.location.pathname)) {

	document.addEventListener('DOMContentLoaded', function() {

		var AnimeTitleRaw = $('.barContent > div > a.bigChar').text(); // Used for Pinned List related stuff
		var AnimeTitle = AnimeTitleRaw.replace(' (Sub)', '').replace(' (Dub)', '').trim();
		var otherNames = [AnimeTitle];

		$('span:contains("Other name:")').parent().find('a').each(function() {
			otherNames.push($(this).text());
		});

		$('head').append(`<link href="${chrome.runtime.getURL('assets/css/AnimeInfo.css')}" rel="stylesheet" type="text/css">`);

		$('span[id*="spanBookmark"]').parent().after(`
			<div class="efka-p">
				<span id="redditThreadContainer" class="KEPad" style="display:none"></span>
			</div>
			<div class="efka-p">
				<div id="malContainer"></div>
			</div>
			<div class="efka-p">
				<div id="kitsuContainer" style="display: none">
					<span id="findInKitsu" class="KEPad">
						<img id="kitsuImg" class="KEImg" src="${chrome.runtime.getURL('images/kitsu.webp')}" style="margin-right:2px">
						<a id="kitsuLink" target="_blank"></a>
					</span>
					<span id="totalScoreKitsuContainer" class="KEPad">
						<span class="info">Kitsu Score: </span>
						<span id="kitsuScore"></span>
					</span>
				</div>
			</div>
		`);

		// Shows the MAL Search/Reddit Discussions Containers if the option is enabled //
		chrome.storage.sync.get(['enableFindinMAL', 'enableFindinKitsu', 'enableFindRedditDiscussions'], function(items) {

			if (items.enableFindinMAL === true) $('#findinMALContainer').css('display', 'inline-block');

			if (items.enableFindinKitsu || items.enableFindinKitsu === undefined) kitsuSearch();

			if (items.enableFindRedditDiscussions == true) {
				$('#redditThreadContainer').css('display', 'inline-block');
				redditDiscussionLinks();
			}

		});

		/////////////////////////////////////////////////
		//           Start MyAnimeList Stuff           //
		/////////////////////////////////////////////////
		// Lord have mercy on anyone who tries to make //
		//     sense of anything in this section.      //
		/////////////////////////////////////////////////

		chrome.storage.local.get(['enableMALAPI', 'MALLoggedIn'], function(items) {

			if (items.enableMALAPI === true && items.MALLoggedIn === true) {

				$('#malContainer').append(`
					<div class="loading-mal" style="text-align:center">
						<div class="loading-pulse" style="margin:auto"></div>
						<div class="loading-pulse-text" style="margin-top:5px">Searching MyAnimeList</div>
					</div>
				`);

				var AnimeTitles = otherNames;

				chrome.runtime.sendMessage({
					MALv2: {
						type: 1,
						titles: AnimeTitles,
						path: window.location.pathname
					}
				}, function(response) {
					$('.loading-mal').remove();
					if (response.success) malAPIv2(response);
					else malSearch();
					if (!response.success && response.error === 429) toastr.error(response.data, 'MyAnimelist Integration', { timeOut: "15000", extendedTimeOut: "15000", positionClass: "toast-top-right" });
				});

			} else malSearch();

		});

		function malAPIv2(response) {

			"use strict"; // Fuck it

			console.log(response);

			// $('#malContainer').show();

			let id = parseInt(response.data.mal.id);
			var inUserMAL = response.data.user ? true : false;
			var inDB = response.data.inDB;

			$('#malContainer').prepend(`

				<span id="addRemoveMALContainer" class="KEPad">
					<img id="addRemoveMALImg" class="KEImg" src="/Content/images/plus.png">
					<a id="addRemoveMAL" href="javascript:void(0)"></a>
				</span>

				<span id="statusMALContainer" class="KEPad KEHide">
					<span>Your Status: </span>
					<select id="statusDropdown" class="KEDropdown">
						<option value="1">Watching</option>
						<option value="2">Completed</option>
						<option value="3">On Hold</option>
						<option value="4">Dropped</option>
						<option value="6" selected>Plan To Watch</option>
					</select>
				</span>

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

				<span id="episodeMALContainer" class="KEPad KEHide">
					<span>Eps Seen:</span>
					<input type="number" id="episodesUserCurrentText" class="KETextInput" style="border: 1px solid grey;" value="0" min="0">
					<span>/</span>
					<input type="text" id="episodesTotalText" class="KETextInput" disabled>
				</span>

				<span id="userDate" class="KEPad KEHide">
					<span>Started:</span>
					<select id="startMonth" class="KEDropdown monthSelection">
						<option value="00" selected>- Month -</option>
						<option value="01">January</option>
						<option value="02">Febuary</option>
						<option value="03">March</option>
						<option value="04">April</option>
						<option value="05">May</option>
						<option value="06">June</option>
						<option value="07">July</option>
						<option value="08">August</option>
						<option value="09">September</option>
						<option value="10">October</option>
						<option value="11">November</option>
						<option value="12">December</option>
					</select>
					&nbsp;
					<select id="startDay" class="KEDropdown dateSelection">
						<option value="00" selected>- Day -</option>
					</select>
					&nbsp;
					<select id="startYear" class="KEDropdown yearSelection">
						<option value="0000" selected>- Year -</option>
					</select>
					&nbsp;
					<span>Finished:</span>
					<select id="endMonth" class="KEDropdown monthSelection">
						<option value="00" selected>- Month -</option>
						<option value="01">January</option>
						<option value="02">Febuary</option>
						<option value="03">March</option>
						<option value="04">April</option>
						<option value="05">May</option>
						<option value="06">June</option>
						<option value="07">July</option>
						<option value="08">August</option>
						<option value="09">September</option>
						<option value="10">October</option>
						<option value="11">November</option>
						<option value="12">December</option>
					</select>
					&nbsp;
					<select id="endDay" class="KEDropdown dateSelection">
						<option value="00" selected>- Day -</option>
					</select>
					&nbsp;
					<select id="endYear" class="KEDropdown yearSelection">
						<option value="0000" selected>- Year -</option>
					</select>
					&nbsp;
					<button type="button" id="saveDates" class="KEDropdown">Update Dates</button>
				</span>

				<span id="findinMALContainer" class="KEPad">
					<img id="MALImage" class="KEImg" src="${chrome.runtime.getURL('images/mal-icon.png')}">
					<a href="http://myanimelist.net/anime/${id}" target="_blank">MAL Page</a>
				</span>

				<span id="totalScoreMALContainer" class="KEPad">
					<span class="info">MAL Score: </span>
					<span id="malScore">N/A</span>
				</span>

			`);

			// if (!inDB) $('#malContainer').append('<span id="malNotice">Notice!</span>')

			if (response.data.mal.score) $('#malScore').text(response.data.mal.score);

			if (inUserMAL) {

				$('#addRemoveMAL').text('Remove From MAL'); // Changes the Text
				$('#addRemoveMALImg').attr('src', '/Content/images/minus.png'); // Changes the Img
				$('#statusDropdown').val(response.data.user.data.my_status); // Adds the value for the Current Status
				$('#scoreDropdown').val(response.data.user.data.my_score); // Adds the value for the Current Score
				$('#episodesUserCurrentText').val(response.data.user.data.my_watched_episodes); // Adds the value for the Current Episode
				if (parseInt(response.data.user.data.series_episodes) !== 0) $('#episodesUserCurrentText').attr('max', response.data.user.data.series_episodes); // Sets the max input value if the total episodes does not equal 0
				$('#episodesTotalText').val(response.data.user.data.series_episodes); // Adds the value for the Total Episodes

				for (let i = 1; i <= 31; i++) {

					var day = i;
					if (day.toString().length == 1) day = '0' + day;
					$('#startDay').append(`<option value=${day}>${i}</option>`);
					$('#endDay').append(`<option value=${day}>${i}</option>`);

				}

				for (let i = new Date().getFullYear(); i >= 1980; i--) {

					$('#startYear').append(`<option value=${i}>${i}</option>`);
					$('#endYear').append(`<option value=${i}>${i}</option>`);

				}

				var startDate = response.data.user.data.my_start_date.split('-');
				$('#startMonth').val(startDate[1]);
				$('#startDay').val(startDate[2]);
				$('#startYear').val(startDate[0]);

				var endDate = response.data.user.data.my_finish_date.split('-');
				$('#endMonth').val(endDate[1]);
				$('#endDay').val(endDate[2]);
				$('#endYear').val(endDate[0]);

				$('#statusMALContainer, #scoreMALContainer, #episodeMALContainer, #userDate').removeClass('KEHide'); // Shows every container

			} else {

				$('#addRemoveMAL').text('Add To MAL');
				$('#addRemoveMALImg').attr('src', '/Content/images/plus.png');
				if (parseInt(response.data.mal.episodes) !== 0) $('#episodesUserCurrentText').attr('max', response.data.mal.episodes);
				$('#episodesTotalText').val(parseInt(response.data.mal.episodes));

			}

			/* == Add/Remove from MyAnimeList == */
			$('#addRemoveMAL').click(function() {

				if (inUserMAL) {

					createDialog(`Are you sure you wish to remove <span style="color:yellow">${AnimeTitle}</span> from your MyAnimeList?`, 'Confirmation', 'Yes', 'No', function() {

						chrome.runtime.sendMessage({ MALv2: { type: 3, id: id } }, function(response) {

							console.log('Remove Status:', response);

							if (response.success) {

								inUserMAL = false;
								$('#addRemoveMAL').text('Add To MAL');
								$('#addRemoveMALImg').attr('src', '/Content/images/plus.png');

								/* == Set Defaults == */
								$('#statusDropdown').val('6'); $('#scoreDropdown').val('0');
								$('#episodesUserCurrentText').val('0');
								$('.dateSelection, .monthSelection').val('00');
								$('.yearSelection').val('0000');

								$('#statusMALContainer, #scoreMALContainer, #episodeMALContainer, #userDate').addClass('KEHide');

								toastr['success']('Removed from MyAnimeList!');

							} else toastr['error'](response.data);

						});

					});

				} else {

					chrome.runtime.sendMessage({ MALv2: { type: 2, id: id } }, function(response) {

						console.log('Add Status', response);

						if (response.success) {

							inUserMAL = true;
							$('#addRemoveMAL').text('Remove From MAL');
							$('#addRemoveMALImg').attr('src', '/Content/images/minus.png');

							for (let i = 1; i <= 31; i++) {

								var day = i;
								if (day.toString().length == 1) day = '0' + day;
								$('#startDay').append(`<option value=${day}>${i}</option>`);
								$('#endDay').append(`<option value=${day}>${i}</option>`);

							}

							for (let i = new Date().getFullYear(); i >= 1980; i--) {

								$('#startYear').append(`<option value=${i}>${i}</option>`);
								$('#endYear').append(`<option value=${i}>${i}</option>`);

							}

							$('#statusMALContainer, #scoreMALContainer, #episodeMALContainer, #userDate').removeClass('KEHide');

							toastr['success']('Added to MyAnimeList!');

						} else toastr['error'](response.data);

					});

				}

			});

			/* == Update Status == */
			$('#statusDropdown').on('change', function() {

				console.log(this.value);

				chrome.runtime.sendMessage({ MALv2: { type: 5, id: id, status: this.value } }, function(response) {

					console.log('Update Status:', response);

					if (response.success) toastr['success']('Status Updated!');
					else toastr['error'](response.data);

				});

			});

			/* == Update Score == */
			$('#scoreDropdown').on('change', function() {

				console.log(this.value);

				chrome.runtime.sendMessage({ MALv2: { type: 6, id: id, score: this.value } }, function(response) {

					console.log('Score Status:', response);

					if (response.success) toastr['success']('Score Updated!');
					else toastr['error'](response.data);

				});

			});

			/* == Previous Episode Number == */
			var currentEpisodeValue;

			/* ==  == */
			$('#episodesUserCurrentText').on('focus', function() {

				currentEpisodeValue = this.value;

				$(this).animate({'width': '40px'});

			});

			/* == Update Episode == */
			$('#episodesUserCurrentText').on('blur', function() {

				$(this).animate({'width': '25px'});

				if (currentEpisodeValue != this.value) {

					chrome.runtime.sendMessage({ MALv2: { type: 4, id: id, episode: this.value } }, function(response) {

						console.log('Episode Status:', response);

						if (response.success) toastr['success']('Episode Updated!');
						else toastr['error'](response.data);

					});

				}

			});

			$('#saveDates').click(function() {

				var startDate = $('#startMonth').val() + $('#startDay').val() + $('#startYear').val();
				var endDate = $('#endMonth').val() + $('#endDay').val() + $('#endYear').val();

				$('html').css('cursor', 'progress');

				chrome.runtime.sendMessage({ MALv2: { type: 7, id: id, dates: [startDate, endDate] } }, function(response) {

					if (response.success) toastr['success']('Dates Updated!');
					else toastr['error'](response.data);

					$('html').css('cursor', 'default');

				});

			});

		}

		function malSearch() {

			$('#malContainer').append('<span id="findinMALContainer" class="KEPad"></span>')
			$('#findinMALContainer').append(`<img id="MALImage" class="KEImg" src=${chrome.runtime.getURL('images/mal-icon.png')}>`);
			$('#findinMALContainer').append(`<a href="http://myanimelist.net/anime.php?q=${encodeURIComponent(AnimeTitle)}" target="_blank">Find in MAL</a>`);
			$('#malContainer').show();

		}

		///////////////////////////////////////////////
		//           End MyAnimeList Stuff           //
		///////////////////////////////////////////////

		///////////////////////
		// Start Kitsu Stuff //
		///////////////////////

		function kitsuSearch() {

			var AnimeTitles = otherNames;

			chrome.runtime.sendMessage({
				kitsu: {
					type: 1,
					titles: AnimeTitles,
					path: window.location.pathname
				}
			}, function(response) {

				if (response.success) {

					var kitsuData = response.data.kitsu;

					$('#kitsuLink').text('Kitsu Page').attr('href', 'https://kitsu.io/anime/' + kitsuData.attributes.slug);

					$('#kitsuScore').text(Math.floor(kitsuData.attributes.averageRating)/10 || 'N/A');

					$('#kitsuContainer').show();

				} else {

					$('#kitsuLink').text('Find in Kitsu').attr('href', 'https://kitsu.io/anime?text=' + encodeURIComponent(AnimeTitle));

					$('#kitsuScore').text('N/A');

					$('#kitsuContainer').show();

				}

			});

		}

		/////////////////////
		// End Kitsu Stuff //
		/////////////////////

		/////////////////////////
		// Start Anilist Stuff //
		/////////////////////////

		// Todo
		// - Figure out how oAuth2 works.
		// - The above x2

		///////////////////////
		// End Anilist Stuff //
		///////////////////////

		///////////////////////////////////
		// Search for Reddit Discussions //
		///////////////////////////////////

		var searchTemplate = 'subreddit:anime self:yes title:"[Spoilers]" title:"[Discussion]" (selftext:MyAnimelist OR selftext:MAL) ';
		var searchTitles = [];
		for (var title of otherNames) searchTitles.push(`title:"${title.replace('(TV)', '')}"`);
		var searchQuery = `https://reddit.com/r/anime/search?q=${encodeURIComponent(searchTemplate+'('+searchTitles.join(' OR ')+')')}&restrict_sr=on&sort=new&t=all`;

		var reddit_logo = chrome.extension.getURL('images/reddit-icon.png');
		$('#redditThreadContainer').append(`<img id="RedditImage" class="KEImg" src=${reddit_logo}>`);
		$('#redditThreadContainer').append(`<a id="RedditLink" href="${searchQuery}" target="_blank">Reddit Discussions</a>`);

		function redditDiscussionLinks() {

			$('.listing td:first-child').each(function() {

			 	var element = $(this).find('a');
			 	var episode = $(element).text().split('Episode').pop();
			 	episode = parseInt(episode);

			 	if (!episode) return;

			 	var episodeSearchTitles = [];
			 	for (title of otherNames) episodeSearchTitles.push(`title:"${title.replace('(TV)', '')} - Episode ${episode}"`);
			 	var searchQuery = `https://reddit.com/r/anime/search?q=${encodeURIComponent(searchTemplate+'('+episodeSearchTitles.join(' OR ')+')')}&restrict_sr=on&sort=new&t=all`;

			 	$(element).after(` - <a href="${searchQuery}" target="_blank">Reddit Discussion</a>`);

			});

		}

		/////////////////////////
		// Pinned List Manager //
		/////////////////////////

		$('#redditThreadContainer').after('<span id="PinnedManager"></span>');
		$('#PinnedManager').append('<img id="PMimg" class="KEImg" src="/Content/images/plus.png">');
		$('#PinnedManager').append('<a id="PinnedManagerText">Pin to Homepage</a>');
		$('#PinnedManagerText').css("cursor","pointer");

		var url = '//' + window.location.host + window.location.pathname;
		var imgURL = $('#rightside .barContent img').first().attr('src');

		chrome.storage.sync.get('PinnedListURLs', function(items) {
			if (items.PinnedListURLs != null && $.inArray(window.location.pathname, items.PinnedListURLs) > -1) {
				$('#PinnedManagerText').text('Unpin from Homepage');
				$('#PMimg').attr('src', '/Content/images/minus.png');
			}
		});

		$('#PinnedManagerText').click(function() {

			chrome.storage.sync.get(['PinnedList', 'PinnedListURLs', 'PinnedListLW', 'PinnedListImg'], function(items) {

				if (items.PinnedList == null) { // If Pinned List doesn't exist. i.e New User

					var PinnedList = [AnimeTitleRaw];
					var PinnedListURLs = [window.location.pathname];
					var PinnedListLW = ['null'];
					var PinnedListImg = [imgURL];

					$('#PinnedManagerText').text('Unpin from Homepage');
					$('#PMimg').attr('src', '/Content/images/minus.png');

					chrome.storage.sync.set({
						PinnedList: PinnedList,
						PinnedListURLs: PinnedListURLs,
						PinnedListLW: PinnedListLW,
						PinnedListImg: PinnedListImg
					});

				} else if (items.PinnedListURLs.includes(window.location.pathname)) { // If Anime exist in Pinned List

					var PinnedList = items.PinnedList;
					var PinnedListURLs = items.PinnedListURLs;
					var PinnedListLW = items.PinnedListLW;
					var PinnedListImg = items.PinnedListImg;
					var AnimePos = items.PinnedListURLs.indexOf(window.location.pathname);

					PinnedList.splice( AnimePos, 1 );
					PinnedListURLs.splice( AnimePos, 1 );
					PinnedListLW.splice( AnimePos, 1 );
					PinnedListImg.splice( AnimePos, 1 );

					$('#PMimg').attr('src', '/Content/images/plus.png');
					$('#PinnedManagerText').text('Pin to Homepage');

					chrome.storage.sync.set({
						PinnedList: PinnedList,
						PinnedListURLs: PinnedListURLs,
						PinnedListLW: PinnedListLW,
						PinnedListImg: PinnedListImg
					});

				} else { // If Anime doesn't exist in Pinned List

					if ( items.PinnedList.length <= 70 ) {

						var PinnedList = items.PinnedList;
						var PinnedListURLs = items.PinnedListURLs;
						var PinnedListLW = items.PinnedListLW;
						var PinnedListImg = items.PinnedListImg;

						PinnedList.push( AnimeTitleRaw );
						PinnedListURLs.push( window.location.pathname );
						PinnedListLW.push( 'null' );
						PinnedListImg.push( imgURL );

						$('#PinnedManagerText').text('Unpin from Homepage');
						$('#PMimg').attr('src', '/Content/images/minus.png');

						chrome.storage.sync.set({
							PinnedList: PinnedList,
							PinnedListURLs: PinnedListURLs,
							PinnedListLW: PinnedListLW,
							PinnedListImg: PinnedListImg
						});

					} else {

						toastr['error']('Max Pinned List Items Reached! 70/70', '', {positionClass: "toast-top-center"});

					}
				}

			});

		});

		////////////////////////////////
		// Hides the comments warning //
		////////////////////////////////

		// $('.episodeList div:last-child > div[style="color: #d5f406"]').hide();

		/////////////////////////////////////
		// Download All (Might be scraped) //
		/////////////////////////////////////

		// Thanks to https://www.reddit.com/user/Nadermane for helping with this feature //
		chrome.storage.sync.get('enableDownloadAllLinks', function(items) {

			return; // Disabled this temporarily disabled

			// Required scripts loaded in order if they don't load in order, it won't work. Didn't want to do this as sync
			$.get('/Scripts/css.js', () => {
				console.log('%c[Download All] Loaded /Scripts/css.js', 'color:skyblue;');
				$.get('/Scripts/vr.js?v=1', () => {
					console.log('%c[Download All] Loaded /Scripts/vr.js', 'color:skyblue;');
					$.get('/Scripts/shal.js', () => {
						console.log('%c[Download All] Loaded /Scripts/shal.js', 'color:skyblue;');
						$.get('/Scripts/moon.js', () => {
							console.log('%c[Download All] Loaded /Scripts/moon.js', 'color:skyblue;');
							$.get('/Scripts/file3.js', () => {
								console.log('%c[Download All] Loaded /Scripts/file3.js', 'color:skyblue;');
								console.log('%c[Download All] All required scripts loaded!', 'color:skyblue;');
							});
						});
					});
				});
			});

			var isLoggedIn = $('#aDropDown > span').text().match(/([A-z,0-9])\w+/g) ? true : false;

			if (items.enableDownloadAllLinks == true && $('.episodeList .listing').length) {

				var totalepisodes = $('.listing td:first-child').length;
				var isBusy = false;
				var SelectedQuality = "1080";
			 	var downloadMethod = "chrome";
				var downloadWarning = false;
				var SelectedEpisodesTitle = [];
				var SelectedEpisodes = [];
				var Links = [];
				var filenames = [];
				var quality = [];
				var extensions = [];
				var ajaxRequest;

				var tableElements = $(".listing > tbody > tr");
				var tableElementsHead = $( tableElements[0] ).html().trim().toLowerCase();

				if (tableElementsHead.indexOf("episode name") > -1 && tableElementsHead.indexOf("day added") > -1) {

					tableElements.splice(1,1);

					tableElements.each(function(index, value) {
						if ( index === 0 ) {
							$(this).append('<th>DL</th>');
						} else {
							$(this).append('<td><input type="checkbox" class="downloadCheckBox" name="downloadCheckBox"></td>');
						}
					});

					$('.listing').parent().before(`
							<div class="download-all-container" style="text-align:center;">

								<h3>Download Options:</h3>

								<span>Download Quality: </span>

								<select id="downloadQuality" class="KEDropdown">
									<option value="1080">1080p</option>
									<option value="720">720p</option>
									<option value="480">480p</option>
									<option value="360">360p</option>
								</select>

								&nbsp;

								<span>Download Method: </span>
								<select id="downloadMethod" class="KEDropdown">
									<option value="chrome">Default Chrome Downloader</option>
									<option value="extDLManager">External Download Manager</option>
								</select>

								<div class="clear2"></div>

								<label for="includeZeros">
									<div class="custcheck">
										<input id="includeZeros" style="display:none" type="checkbox" value="includeZeros">
									</div>
									<span>Include Leading Zeros in Episode #</span>
								</label>

								&nbsp;

								<label for="createFolder" id="createFolderContainer">
									<div class="custcheck">
										<input id="createFolder" style="display:none" type="checkbox" value="createFolder">
									</div>
									<span>Create Folder</span>
								</label>

								<div id="folderNameContainer" style="display:none;padding-top:5px">
									<label for="folderName">Folder Name</label>
									<input type="text" id="folderName" class="KEDropdown" size="60" style="text-align:center">
								</div>

								<div class="clear2"></div>
								<span>Select: </span><a href="javascript:void(0)" id="selectAll">All</a><span> | </span><a href="javascript:void(0)" id="selectNone">None</a><span> | </span><a href="javascript:void(0)" id="selectToggle">Toggle</a><span>

								&nbsp;

								<button type="button" id="downloadStart" class="KEDropdown">Start</button>

								<div id="downloadStatus" style="margin-top:10px;display:none"></div>

								<div id="textLinksContainer">
									<div class="clear2"></div>
									<textarea id="textLinks" rows="5" readonly></textarea>
									<div class="clear2"></div>
									<a href="javascript:void(0)" id="copyLinks">Copy Links to Clipboard</a>
								</div>

								<style>
									#textLinksContainer {
										display: none;
									}
									#textLinks {
										width: 100%;
										resize: none;
										white-space: pre;
										word-wrap: normal;
										color: white;
										background: rgba(22, 22, 22, 0.5);
										border: 1px dotted grey;
									}
									.custcheck {
										display: inline-block;
										vertical-align: sub;
										height: 12px;
										width: 12px;
										border: 1px solid grey;
									}
									#textLinks::-webkit-scrollbar {
										height: 0px;
										width: 0px;
									}
								</style>

							</div>
					`);

				}

				if (!isLoggedIn) {

					$('#downloadQuality, #downloadMethod, #includeZeros, #createFolder, #folderName, #downloadStart').prop('disabled', true);
					$('.download-all-container').css({
						'opacity': '0.4',
						'pointer-events': 'none',
						'user-select': 'none',
					}).before('<h3 style="text-align:center">You must be logged into a KissAnime account for this feature to work.</h3>');
					return;

				}

				$('#downloadQuality').change(function() {
					SelectedQuality = this.value;
				});

				$('#downloadMethod').change(function() {

					downloadMethod = this.value;

					if (this.value == 'chrome') {
						$('#createFolderContainer').show();
					} else {
						$('#createFolderContainer').hide();
						$('#createFolder')[0].checked = false;
						$('#createFolder').change();
					}

				});

				$('#folderName').val(AnimeTitle.replace(/[\\/:\*\?"<>\|]/g, '')).on('keypress', function(e) {

					if (/[\\/:\*\?"<>\|]/g.test(String.fromCharCode(e.keyCode))) {

						status('Charcater <span style="color:yellow">'+String.fromCharCode(e.keyCode)+'</span> not allowed in filename!', 3000);
						e.preventDefault();

					} else return;

				});

				$('#createFolder').change(function() {

					if (this.checked == true) $('#folderNameContainer').show();
					else $('#folderNameContainer').hide();

				});

				$('.custcheck input').change(function() {

					if (this.checked == true) $(this).parent().css('background', 'skyblue');
					else $(this).parent().css('background', 'none');

				});

				$(".downloadCheckBox").change(function() {
					this.checked ? $(this).closest('tr').addClass('ui-selected') : $(this).closest('tr').removeClass('ui-selected') ;
				});

				$(document).on('click', '#selectAll', function() {

					$(".downloadCheckBox").prop('checked', true).trigger('change');

				}).on('click', '#selectNone', function() {

					$(".downloadCheckBox").prop('checked', false).trigger('change');

				}).on('click', '#selectToggle', function() {

					$(".downloadCheckBox").each(function() {
						$(this).prop("checked", !$(this).prop("checked"));
					}).trigger('change');

				}).on('click', '#multiSelect', function() {

					if ($(this).attr('data-toggle') == "true") {
						$(this).attr('data-toggle', "false").find('#multiSelectStatus').text('[OFF]');
						$('.listing > tbody').selectable('disable');

					} else {

						$(this).attr('data-toggle', "true").find('#multiSelectStatus').text('[ON]');
						$('.listing > tbody').selectable('enable');

					}

				});


				$('.listing > tbody').selectable({
					filter: 'tr:nth-child(n+2)',
					cancel: 'a, input',
					selecting: function(event, ui) {
						$(ui.selecting).find(".downloadCheckBox").prop('checked', true);
					},
					unselecting: function(event, ui) {
						$(ui.unselecting).find(".downloadCheckBox").prop('checked', false);
					}
				});

				$(document).on('click', '#downloadStart', function() {

					if (isBusy == false) {

						/* == Clears the arrays == */
						SelectedEpisodes = [];
						SelectedEpisodesTitle = [];
						Links = [];
						filenames = [];
						quality = [];
						extensions = [];

						$(".downloadCheckBox:checked").parents('tr').each(function() {

							var episodeLink = $(this).children("td").first().find('a').first().prop('href');
							var episodeTitle = $(this).children("td").first().find('a').first().text().trim().replace(/[\\/:\*\?"<>\|]/g, ''); // .replace(/[\\/:\*\?"<>\|]/, '') removes any characters that cannot be used in windows filenames

							console.log(episodeTitle);

							if ($('#includeZeros')[0].checked == false) episodeTitle = episodeTitle.replace(/(?!Episode) \b0+/g, ' ');

							SelectedEpisodes.push(episodeLink);
							SelectedEpisodesTitle.push(episodeTitle);

							if ($('#createFolder')[0].checked == true) filenames.push($('#folderName').val()+'/'+episodeTitle);
							else filenames.push(episodeTitle);

						});

						if (SelectedEpisodes.length > 24 && downloadMethod == 'chrome') downloadWarning = true;
						else if (SelectedEpisodes.length <= 24 && downloadMethod == 'chrome') downloadWarning = false;

						if (SelectedEpisodes.length && downloadWarning == false) {

							$(this).text('Stop');
							$('#textLinksContainer').hide();
							status('<div style="color:gold">Starting...</div>');
							doRequest();

						} else if (SelectedEpisodes.length && downloadWarning == true) {

							toastr['error']('<div style="margin-bottom:5px">You are about to start downloading 24+ episodes. DOING THIS IS NOT RECOMMENDED! YOU WILL BE SPAMMED WITH SAVE-AS DIALOG BOXES!</div><button type="button" class="downloadWarningContinue btn clear">Continue</button>&nbsp;<button type="button" class="downloadWarningCancel btn clear">Cancel</button>', 'Are you sure you wish to continue?', {timeOut: 0, extendedTimeOut: 0, positionClass: "toast-top-center"});

							$(document).on('click', '.downloadWarningContinue', function() {
								$('#downloadStart').text('Stop');
								$('#textLinksContainer').hide();
								doRequest();
							}).on('click', '.downloadWarningCancel', function() {
								console.log('Good. Smart choice.');
							});

						} else {

							status('Nothing is Selected!', 3000);
							console.log('Nothing is Selected!');

						}

					} else {

						doEnd();
						ajaxRequest.abort();
						$(this).text('Start');
						status('Stopped!', 3000);

					}

				});

				function doRequest() {

					$('#downloadQuality, #downloadMethod, #includeZeros, #createFolder, #folderName').prop('disabled', true);

					isBusy = true;

					ajaxRequest = $.ajax({
						url: SelectedEpisodes[0],
						success: function(data) {

							if (SelectedEpisodes.length > 0) {

								status('<div>Remaining: '+SelectedEpisodes.length+'</div></div>Finding Download Link for <span style="color:yellow">'+SelectedEpisodesTitle[0]+'</span></div>');

								var DownloadContainer;

								// This is the point where the script will fail if KissAnime asks for the user to answer a Captcha. //
								try {

								 	var fuckYouKissAnime = $(data).find('#divDownload')[0].outerHTML;
									fuckYouKissAnime = $(fuckYouKissAnime).find('script')[0].innerHTML.trim().replace(`document.write(ovelWrap('`, '').replace(`'));`, '');
									DownloadContainer = $(`<div>${ovelWrap(fuckYouKissAnime)}</div>`);

								} catch(err) {

									console.log(err);

									status('<div style="color:orangered">Captcha Required!</div>');

									$('body').append('<iframe id="areYouAHuman" class="nah" src='+SelectedEpisodes[0]+'></iframe>');

									$('#areYouAHuman').css({
										'position': 'fixed',
										'width': '1000px',
										'height': '500px',
										'top': '10%',
										'left': '0px',
										'right': '0px',
										'margin': 'auto'
									});

									$('#areYouAHuman').load(function() {

										//$('#areYouAHuman').contents().find("#head, #headnav, #footer").hide();
										$('#areYouAHuman').contents().find("body > *:not('#containerRoot')").hide();
										$('#areYouAHuman').contents().find("#containerRoot > *:not('#container')").hide();
										$('#areYouAHuman').contents().find('body').prepend("<h2 style='padding-left: 5px'>The Download All option has Triggered KissAnime's Bot Detection. Please answer the Captcha below to continue.</h2>");

										$('#areYouAHuman').contents().find("#formVerify #btnSubmit").click(function(e) {

											$('#areYouAHuman').hide();

											status('<div style="color:gold">Retrying...</div>');

											setTimeout(function() {
												$('#areYouAHuman').remove();
												doRequest();
											}, 2000);

										});

									});

								}

								if ($(DownloadContainer).find('a[href*="googlevideo"]').length) {

									console.log('Direct GoogleVideo Link');

									var itag37 = $(DownloadContainer).find('a[href*="itag=37"]');
								 	var itag22 = $(DownloadContainer).find('a[href*="itag=22"]');
									var itag59 = $(DownloadContainer).find('a[href*="itag=59"]');
									var itag18 = $(DownloadContainer).find('a[href*="itag=18"]');
									var itag43 = $(DownloadContainer).find('a[href*="itag=43"]');

									if (SelectedQuality == "1080") {

										if (itag37.length) {
											Links.push(itag37.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag37.text().split('.')[1]);
										} else if (itag22.length) {
											Links.push(itag22.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag22.text().split('.')[1]);
										} else if (itag59.length) {
											Links.push(itag59.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag59.text().split('.')[1]);
										} else if (itag18.length) {
											Links.push(itag18.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag18.text().split('.')[1]);
										} else if (itag43.length) {
											Links.push(itag43.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag43.text().split('.')[1]);
										} else {
											Links.push('No Link');
										}

									} else if (SelectedQuality == "720") {

										if (itag22.length) {
											Links.push(itag22.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag22.text().split('.')[1]);
										} else if (itag59.length) {
											Links.push(itag59.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag59.text().split('.')[1]);
										} else if (itag18.length) {
											Links.push(itag18.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag18.text().split('.')[1]);
										} else if (itag43.length) {
											Links.push(itag43.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag43.text().split('.')[1]);
										} else {
											Links.push('No Link');
										}

									} else if (SelectedQuality == "480") {

										if (itag59.length) {
											Links.push(itag59.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag59.text().split('.')[1]);
										} else if (itag18.length) {
											Links.push(itag18.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag18.text().split('.')[1]);
										} else if (itag43.length) {
											Links.push(itag43.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag43.text().split('.')[1]);
										} else {
											Links.push('No Link');
										}

									} else if (SelectedQuality == "360") {

										if (itag18.length) {
											Links.push(itag18.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag18.text().split('.')[1]);
										} else if (itag43.length) {
											Links.push(itag43.attr('href') + "&title=" + encodeURI(SelectedEpisodesTitle[0]));
											extensions.push(itag43.text().split('.')[1]);
										} else {
											Links.push('No Link');
										}

									}

									console.log(SelectedEpisodesTitle[0]);
									console.log('1080p: '+itag37.attr('href'));
									console.log('720p: '+itag22.attr('href'));
									console.log('480p: '+itag59.attr('href'));
									console.log('360p: '+itag18.attr('href'));
									console.log('360p?: '+itag43.attr('href'));

									SelectedEpisodesTitle.shift();
									SelectedEpisodes.shift();

									/* == SetTimeout is so there is a less likely chance that the Captcha will be triggered == */
									setTimeout(function() {
										doRequest();
									}, 800);

								} else if ($(DownloadContainer).find('a[href*="blogspot"]').length) {

									console.log('Blogspot Link');

									var m37 = $(DownloadContainer).find('a[href$="m37"]');
									var m22 = $(DownloadContainer).find('a[href$="m22"]');
									var m18 = $(DownloadContainer).find('a[href$="m18"]');
									var m36 = $(DownloadContainer).find('a[href$="m36"]');

									// m37 = 1080p or equivalent //
									// m22 = 720p or equivalent  //
									// m18 = 360p or equivalent  //
									// m36 = 180p or equivalent  //

									if (SelectedQuality == "1080") {

										if (m37.length) { // 1080
											Links.push(m37.attr('href'));
											extensions.push(m37.text().split('.')[1]);
										} else if (m22.length) { // 720
											Links.push(m22.attr('href'));
											extensions.push(m22.text().split('.')[1]);
										} else if (m18.length) { // 360
											Links.push(m18.attr('href'));
											extensions.push(m18.text().split('.')[1]);
										} else if (m36.length) {
											Links.push(m36.attr('href'));
											extensions.push(m36.text().split('.')[1]);
										} else {
											Links.push('No Link');
										}

									} else if (SelectedQuality == "720") {

										if (m22.length) { // 720
											Links.push(m22.attr('href'));
											extensions.push(m22.text().split('.')[1]);
										} else if (m18.length) { // 360
											Links.push(m18.attr('href'));
											extensions.push(m18.text().split('.')[1]);
										} else if (m36.length) {
											Links.push(m36.attr('href'));
											extensions.push(m36.text().split('.')[1]);
										} else {
											Links.push('No Link');
										}

									} else if (SelectedQuality == "480" || SelectedQuality == "360") {

										if (m18.length) { // 360
											Links.push(m18.attr('href'));
											extensions.push(m18.text().split('.')[1]);
										} else if (m36.length) {
											Links.push(m36.attr('href'));
											extensions.push(m36.text().split('.')[1]);
										} else {
											Links.push('No Link');
										}

									}

									console.log(SelectedEpisodesTitle[0]);
									console.log('1080p:', m37.attr('href'));
									console.log('720p:', m22.attr('href'));
									console.log('360?:', m18.attr('href'));
									console.log('240/180p?:', +m36.attr('href'));

									SelectedEpisodesTitle.shift();
									SelectedEpisodes.shift();

									/* == SetTimeout is so there is a less likely chance that the Captcha will be triggered == */
									setTimeout(function() {
										doRequest();
									}, 800);

								} else if ($(DownloadContainer).find('a[href*="openload"]').length) {

									var video = $(DownloadContainer).find('a[href*="openload"]').attr('href');

									Links.push(`OPENLOAD VIDEO. CANNOT GET DOWNLOAD LINK - ${SelectedEpisodesTitle[0]}`);

									console.log(SelectedEpisodesTitle[0]);
									console.log('Openload:', video);

									SelectedEpisodesTitle.shift();
									SelectedEpisodes.shift();

									/* == SetTimeout is so there is a less likely chance that the Captcha will be triggered == */
									setTimeout(function() {
										doRequest();
									}, 800);

								}

							} else {

								$('#downloadStart').text('Start');
								status('Completed!', 3000);
								doEnd();

							}

						},
						error: function() {

							if (isBusy === false) return console.debug('Aborted!')
							else doRequest();

						}
					});

				}

				function doEnd() {

					$('#downloadQuality, #downloadMethod, #includeZeros, #createFolder, #folderName').prop('disabled', false);

					isBusy = false;

					if (downloadMethod == 'chrome') {

						var downloads = [];

						for (var i = 0; Links.length > i; i++) {

							console.log('Filename: /'+filenames[i]+'.'+extensions[i]);

							downloads.push({
								'url': Links[i],
								'filename': filenames[i]+'.'+extensions[i],
								'saveAs': true
							});

						}

						console.log(downloads);

						chrome.runtime.sendMessage({
							'task': 'downloadAll',
							'data': downloads
						}, function(response) {

							/* Useless. Didn't even realize I didn't set anything as a response.
							console.log(response);
							if ($.isEmptyObject(response)) {
								console.debug('Essentials for KissAnime: undefined object returned in response!');
							} else if (response.download == false) {
								console.debug('Essentials for KissAnime: permission for chrome.download has been denied!');
								toastr['error']('Essentials for KissAnime does not have permission to download!');
							} else if (response.download == true) {
								console.debug('Essentials for KissAnime: permission for chrome.download has been approved!')
							} */

						});

					} else if (downloadMethod == 'extDLManager') {

						$('#textLinksContainer').show();
						$('#textLinks').val(Links.join("\n"));

					}

				}

				$(document).on('click', '#copyLinks', function() {

					$('#textLinks').select();
					document.execCommand('copy');

				});

				var statusTimeout;
				function status(text, timeout) {
					clearTimeout(statusTimeout);
					$('#downloadStatus').html(text).show();
					if (timeout != null) {
						statusTimeout = setTimeout(function(){
							$('#downloadStatus').html('').hide();
						}, timeout);
					}
				}

			}

		});

		// Color in the console //
		function colorLog(text, color) {
			console.log('%c'+text, 'color:'+color);
		}

	});

}
