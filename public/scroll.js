//smooth scrolling
//This is in a separate file because it is the only JS used
//in both index.html & dashboard.html
function smoothScroll() {
	$('.scroll').on('click', function(e) {
		e.preventDefault();
		$('html, body').animate({
			scrollTop: $(this.hash).offset().top-50}, 800);
		$('.navbar-toggle').addClass('collapsed');
		$('.navbar-toggle').attr('aria-expanded', false);
		$('.navbar-collapse').removeClass('in');
		$('.navbar-collapse').attr('aria-expanded', false);
	});
}

$(function() {
	smoothScroll();
});