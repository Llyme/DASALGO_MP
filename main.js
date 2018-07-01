const {app, BrowserWindow} = require("electron");

function init() {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		title: "DASALGO MP"
	});

	//win.setMenu(null);
	win.loadFile("index.html");
	win.on("closed", () => win = null);
}

app.on("ready", init);

app.on("window-all-closed", () =>
	process.platform !== "darwin" && app.quit()
);

app.on("activate", init);
