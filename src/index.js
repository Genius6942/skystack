import { start, mobile } from './main';


document.getElementById('play').addEventListener('click', () => {
	document.getElementById('start').style.display = 'none';
	if (mobile) {
		document.body.requestFullscreen();
	}
	start();
});

const end = (score) => {
	document.getElementById('end').style.display = 'flex';
	document.getElementById('score').innerHTML = score;
	document.getElementById('highscore').innerHTML = localStorage.getItem('highScore') || 0;
}

export { end };

// TODO: startscreen, endscreen