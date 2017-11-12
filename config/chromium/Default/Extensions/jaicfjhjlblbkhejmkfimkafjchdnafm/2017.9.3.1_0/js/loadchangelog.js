$.get('https://efka.pilar.moe/api/changelog?ref=optionspage', function(data, statusText, headers) {

	var changelogVue = new Vue({
		el: "#changelog",
		data: {
			changelog: data,
			lastUpdate: new Date(headers.getResponseHeader('last-modified')).toString()
		},
		mounted: function() {
			$('#changelog').slideDown(1000);
		}
	})

}).fail(function() {
	// Could not load the Changelog. Please <a id="reload" href="#">refresh</a> the page or try again later.
});
