$(document).ready(function() {
	if ( parent !== window ) { // Make sure this doesn't run on the actual site.
		$('head').inject('inline-script', function() {
			var checkForLink = setInterval(function() {
				if ( $('video source')[0] && $('video source')[0].src ) {
					console.debug('RapidVideo Frame: URL found! Sending to parent window.');
					clearInterval(checkForLink);
					// parent.postMessage(['RapidVideoURL', playerInstance.getPlaylist()[0].sources.reverse()], 'http://kissanime.ru');
					parent.postMessage(['RapidVideoURL', videojs($('video').attr('id')).src()], 'http://kissanime.ru');
				} else {
					console.debug('RapidVideo Frame: URL not yet loaded!');
				}
			}, 100);
		});
	}
});
