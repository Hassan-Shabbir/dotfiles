$(document).ready(function() {

	if (document.location.search && $('img[src*="/Special/CapImg"]').length) { // Makes sure this is actually the captcha page

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
			"timeOut": "1500",
			"showEasing": "linear",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut"
		}

		let redirectURL = decodeURIComponent(window.location.search).replace('?reUrl=', '');

		$('head').inject('inline-script', function() {
			$('#formVerify').submit(function() {
				return false;
			});
		});

		let imagesClicked = []

		$('img[src*="/Special/CapImg"]').click(function() {

			var imageIndex = $(this).attr('indexValue');
			var arrayIndex = imagesClicked.indexOf(imageIndex);

			if (arrayIndex > -1) imagesClicked.splice(arrayIndex);
			else imagesClicked.push(imageIndex);

			if (imagesClicked.length === 2) {
				$.ajax({
					url: '/Special/AreYouHuman2',
					type: 'POST',
					contentType: 'application/x-www-form-urlencoded',
					data: { reUrl: redirectURL, answerCap: imagesClicked.join(',') },
					timeout: 15000,
					success: function(data) {
						if (data.indexOf('Wrong answer.') > -1) {
							toastr.error('Wrong answer! Reloading page...');
							setTimeout(() => location.reload(), 1500);
						} else {
							toastr.success('Correct! Loading page...');
							setTimeout(() => location = redirectURL, 1500);
						}
					},
					error: function(xhr) {
						if (xhr.statusText === 'timeout') {
							toastr.warning('Request timed out! Reloading page...')
							setTimeout(() => $.ajax(this), 1500);
						}
					}
				});
			}

		});

	}
	
})