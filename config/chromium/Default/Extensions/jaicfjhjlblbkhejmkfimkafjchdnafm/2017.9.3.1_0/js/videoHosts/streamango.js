$(document).ready(function() {
	if (parent !== window) { // Make sure this doesn't run on the actual site.
		$('head').inject('inline-script', function() {
			var checkForLink = setInterval(function() {
				if (srces) {
					console.debug('Streamango Frame: URL found! Sending to parent window.');
					clearInterval(checkForLink);
					var urls = srces.filter(function(item) {
						return item.type === 'video/mp4'
					})
					parent.postMessage(['StreamangoURL', urls], 'http://kissanime.ru');
				} else {
					console.debug('Streamango Frame: URL not yet loaded!');
				}
			}, 100);
		});
	}
})