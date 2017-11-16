$(document).ready(function() {
	var dots;
	$('.leaveFeedback').ajaxForm({
		submitURL: 'http://www.nosarembo.com/df_youtube/submit_feedback.php',
		disableFormOnSuccess: true,
		disableFormOnSubmit: true,
		errorMessages: 'message',
		extraData: function($this)
		{
			return {subject: 'DF Youtube user feedback'};	
		},
		submitCallback: function($this)
		{
			var message = $this.find('.message');
			
			message.html('Sending...');

			dots = setInterval(function() {
				message.append('.');
			}, 1000);
		},
		completeCallback: function($this, response)
		{
			clearInterval(dots);
		},
		successCallback: function($this, response)
		{
			clearInterval(dots);
			$this.find('.message').html('Thank you for the feedback!');
		}
	});

	$('#forceFeedback').on('click', function() {
		$(this).hide();
		$('#tips').hide();
		$('#content').show();
	});
});