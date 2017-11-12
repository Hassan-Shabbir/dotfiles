chrome.storage.local.get(function(items) {

	$('#local-setting-values').empty();

	for(var key in items) {

		if (key == "MALpass") $('#local-settings-values').append(`<div><span style="color:skyblue">${key}</span>: <span style="color:#C2FF00;font-weight:bold">hidden</span></div>`);
		else $('#local-settings-values').append(`<div><span style="color:skyblue">${key}</span>: <span style="color:#C2FF00">${items[key]}</span></div>`);

	}

});

chrome.storage.sync.get(function(items) {

	if ($.isEmptyObject(items)) {

		$('#sync-settings-values').html('<span style="color: red">Nothing Here.</span>');

	} else {

		$('#sync-setting-values').empty();

		$.each(items, function(index, value) {

			switch(index) {
				case 'PinnedList':
				case 'PinnedListImg':
				case 'PinnedListLW':
				case 'PinnedListURLs':
				case 'lastVideo':
					$('#sync-settings-values').append('<div id='+index+'><span style="color:skyblue;font-size:14px;font-weight:bold">'+index+'</span>: <span>Array</span></div>');
					var currentID = '#'+index;
					$.each(this, function(index, value) {
						index = index++; if (index <= 9) index = "0" + index;
						$(currentID).append('<div><span>['+index+']</span> <span style="color:#C2FF00">'+value+'</span></div>');
					});
					break;
				default:
					$('#sync-settings-values').append('<div id='+index+'><span style="color:skyblue;font-size:14px;font-weight:bold">'+index+'</span>: <span style="color:#C2FF00">'+value+'</span></div>');
			}

		});

	}

});

chrome.permissions.getAll(function(perm) {

	$.each(perm.origins, function(index, value) {

		switch(value) {
			case '*://*.kissanime.ru/*':
				setDesc('#permissions-origins-values', value, 'Needed for the extension to work.');
				break;
			case '*://*.myanimelist.net/*':
				setDesc('#permissions-origins-values', value, 'Needed for the MAL feature to work.');
				break;
			case '*://*.openload.co/*':
				setDesc('#permissions-origins-values', value, 'Used to replace the Openload Player with the KissAnime player.');
				break;
			// default:
			// 	setDesc('#permissions-origins-values', value.replace('<', '&lt;').replace('>', '&gt;'), 'Domain Permission.');
			// 	break;
		}

	});

	$.each(perm.permissions, function(index, value) {

		switch(value) {
			case 'activeTab':
				setDesc('#permissions-api-values', value, 'Mandatory Permission. Allows the extension to modify the contents of http://kissanime.ru/ if it is open in a Tab.');
				break;
			case 'cookies':
				setDesc('#permissions-api-values', value, 'Mandatory Permission. Used for modifying a few of the cookies KissAnime sets in order to enhance the user\'s experience.');
				break;
			case 'downloads':
				setDesc('#permissions-api-values', value, 'Optional Permission. Allows the extension to download to the user\'s computer. Required for the "Download All" option to work.');
				break;
			case 'downloadsInternal':
				setDesc('#permissions-api-values', value, 'Optional Permission. Allows the extension to download to the user\'s computer. Required for the "Download All" option to work.');
				break;
			case 'notifications':
				setDesc('#permissions-api-values', value, 'Mandatory Permission. Used to display notifications.');
				break;
			case 'storage':
				setDesc('#permissions-api-values', value, 'Mandatory Permission. Allows the extension to save in chrome.storage.');
				break;
			case 'webRequest':
				setDesc('#permissions-api-values', value, 'Mandatory Permission. Required for webRequestBlocking.');
				break;
			case 'webRequestBlocking':
				setDesc('#permissions-api-values', value, 'Mandatory Permission. Used to Block Ad Domains that originate from http://kissanime.ru/.');
				break;
		}

	});

});

function setDesc(a, b, c) {
	if (c) $(a).append('<div>'+b+'</div><div class="api-desc"> - <span style="color:skyblue">'+c+'</span></div>');
	else $(a).append('<div>'+b+'</div>');
}
