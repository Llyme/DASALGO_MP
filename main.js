const fs = require("fs");
const {app, BrowserWindow, ipcMain} = require("electron");
const csv = a => a.split(/\r\n|\n/).map(v => v.split(","));

let l = csv(fs.readFileSync("assets/map/Map.csv").toString());

ipcMain.on("map", res => {
	res.returnValue = l;
});

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
