$(document).ready(function() {
	if ( parent !== window ) { // Make sure this doesn't run on the actual site.
		var checkForLink = setInterval(function() {
			$('#videooverlay').click();
			if ( $('#streamurl').text() == "HERE IS THE LINK" ) {
				console.debug('Openload Frame: URL not yet loaded!');
			} else {
				console.debug('Openload Frame: URL found! Sending to parent window.');
				clearInterval(checkForLink);
				parent.postMessage(['OpenloadURL', window.location.origin + '/stream/' + $('#streamurl').text()], 'http://kissanime.ru');
			}
		}, 10);
	}
});
