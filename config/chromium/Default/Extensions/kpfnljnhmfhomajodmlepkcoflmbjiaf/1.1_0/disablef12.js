window.addEventListener("keydown", keyListener, false);

function keyListener(e) {
	if(e.keyCode == 123) {
		e.returnValue = false;
	}
}
