function setTheme(theme) {
	switch(theme) {
		case "light": {
			document.documentElement.style.setProperty("--back-color", "white");
			document.documentElement.style.setProperty("--front-color", "white");
			document.documentElement.style.setProperty("--box-color", "#f6f6f6");
			document.documentElement.style.setProperty("--text-color", "black");
			document.documentElement.style.setProperty("--text-color-70", "rgba(0, 0, 0, 0.7)");
			document.documentElement.style.setProperty("--main-color", "#8632e6");
			document.documentElement.style.setProperty("--main-dark-color", "#231632");
			document.documentElement.style.setProperty("--secondary-color", "#d78cf1");
			document.documentElement.style.setProperty("--secondary-dark-color", "#8F5B9f");
			document.documentElement.style.setProperty("--error-color", "#CB4154");
		} break;
		case "night": {
			document.documentElement.style.setProperty("--back-color", "black");
			document.documentElement.style.setProperty("--front-color", "#181818");
			document.documentElement.style.setProperty("--box-color", "#151515");
			document.documentElement.style.setProperty("--text-color", "white");
			document.documentElement.style.setProperty("--text-color-70", "rgba(255, 255, 255, 0.7)");
			document.documentElement.style.setProperty("--main-color", "#8632e6");
			document.documentElement.style.setProperty("--main-dark-color", "#231632");
			document.documentElement.style.setProperty("--secondary-color", "#d78cf1");
			document.documentElement.style.setProperty("--secondary-dark-color", "#8F5B9f");
			document.documentElement.style.setProperty("--error-color", "#CB4154");
		} break;
		case "dark": {
			document.documentElement.style.setProperty("--back-color", "rgb(14, 14, 14)");
			document.documentElement.style.setProperty("--front-color", "#181818");
			document.documentElement.style.setProperty("--box-color", "#151515");
			document.documentElement.style.setProperty("--text-color", "white");
			document.documentElement.style.setProperty("--text-color-70", "rgba(255, 255, 255, 0.7)");
			document.documentElement.style.setProperty("--main-color", "#8632e6");
			document.documentElement.style.setProperty("--main-dark-color", "#231632");
			document.documentElement.style.setProperty("--secondary-color", "#d78cf1");
			document.documentElement.style.setProperty("--secondary-dark-color", "#8F5B9f");
			document.documentElement.style.setProperty("--error-color", "#CB4154");
		} break;
		default: break;
	}
}

function setColor(color) {
	switch(color) {
		case "red": {
			document.documentElement.style.setProperty("--main-color", "hsl(0, 88%, 52%)");
			document.documentElement.style.setProperty("--main-dark-color", "hsl(0, 81%, 22%)");
			// document.documentElement.style.setProperty("--secondary-color", secondary);
			// document.documentElement.style.setProperty("--secondary-dark-color", darkSecondary);
		} break;
		case "orange": {
			document.documentElement.style.setProperty("--main-color", "hsl(29, 87%, 52%)");
			document.documentElement.style.setProperty("--main-dark-color", "hsl(29, 82%, 23%)");
			// document.documentElement.style.setProperty("--secondary-color", secondary);
			// document.documentElement.style.setProperty("--secondary-dark-color", darkSecondary);
		} break;
		case "yellow": {
			document.documentElement.style.setProperty("--main-color", "hsl(58, 88%, 60%)");
			document.documentElement.style.setProperty("--main-dark-color", "hsl(58, 57%, 19%)");
			// document.documentElement.style.setProperty("--secondary-color", secondary);
			// document.documentElement.style.setProperty("--secondary-dark-color", darkSecondary);
		} break;
		case "green": {
			document.documentElement.style.setProperty("--main-color", "hsl(126, 75%, 53%)");
			document.documentElement.style.setProperty("--main-dark-color", "hsl(125, 69%, 19%)");
			// document.documentElement.style.setProperty("--secondary-color", secondary);
			// document.documentElement.style.setProperty("--secondary-dark-color", darkSecondary);
		} break;
		case "aqua": {
			document.documentElement.style.setProperty("--main-color", "hsl(191, 82%, 56%)");
			document.documentElement.style.setProperty("--main-dark-color", "hsl(191, 64%, 25%)");
			// document.documentElement.style.setProperty("--secondary-color", secondary);
			// document.documentElement.style.setProperty("--secondary-dark-color", darkSecondary);
		} break;
		case "blue": {
			document.documentElement.style.setProperty("--main-color", "hsl(265, 100%, 47%)");
			document.documentElement.style.setProperty("--main-dark-color", "hsl(252, 93%, 23%)");
			// document.documentElement.style.setProperty("--secondary-color", secondary);
			// document.documentElement.style.setProperty("--secondary-dark-color", darkSecondary);
		} break;
		case "purple": {
			document.documentElement.style.setProperty("--main-color", "hsl(265, 100%, 47%)");
			document.documentElement.style.setProperty("--main-dark-color", "#2e016c");
			// document.documentElement.style.setProperty("--secondary-color", secondary);
			// document.documentElement.style.setProperty("--secondary-dark-color", darkSecondary);
		} break;
		case "pink": {
			document.documentElement.style.setProperty("--main-color", "hsl(299, 100%, 47%)");
			document.documentElement.style.setProperty("--main-dark-color", "hsl(299, 98%, 20%)");
			// document.documentElement.style.setProperty("--secondary-color", secondary);
			// document.documentElement.style.setProperty("--secondary-dark-color", darkSecondary);
		} break;
		default: break;
	}
}

export { setTheme, setColor }
