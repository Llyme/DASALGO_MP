// The <body> tag that contains all the visible elements.
const body = document.body;

// Random names to make mail creation feel faster and natural.
const name_struct = [
	"Bob", "Charles", "Margaret", "Carl", "Billy", "Mandy", "Willy",
	"Richard", "Charlie", "Emilly", "Gordon", "Freeman", "Gunther",
	"Fred", "Noel", "Peter", "Stephanie", "Ethan", "Drake", "Randolf",
	"Fredrick", "Roger", "Candice", "Phineas", "Ferb", "Squee",
	"Splee", "Spoon", "Marvin", "Violet", "Summer", "Ruby", "Jasmine",
	"Eugene", "Chloe", "Tiffany", "Louise", "Luis", "Vannessa",
	"Kelly", "Brandon", "Finn", "Sophilia", "Carlos", "Andromeda",
	"Ignacio", "Constantine", "Nick", "Hilda", "Cecie", "Evelyn",
	"Dominic", "Dorothy", "Donald", "Teressa", "Himiko", "Stacy",
	"Chell", "Wheatley", "GLaDOS"
];

// Animation speed index (fastest to slowest).
const speed = [50, 100, 300, 500, 1000];

// Call all the relevant elements so they'll be easily found here.
const e = {
	// The speed slider.
	speed: q("#ctrl div")[0],
	// The speed slider's indicator.
	speed_ball: q("#ctrl div div")[0],
	// The very first thing the user sees upon accessing this app.
	dropdown: q("#dropdown"),
	// The list of the messages to be sorted and sent.
	msg: q("#msg"),
	// The first entry in the '#msg' element.
	msg_main: q("#msg div")[0],
	// The message selection's window.
	msg_sel: q("#msg_sel"),
	// The message selection table.
	msg_sel_tbody: q("#msg_sel tbody")[0],
	// The message selection's buttons.
	msg_sel_btn: q("#msg_sel #btn div"),
	// AKA 'workspace', this will hold the points of the addresses.
	space: q("#space"),
	// This element will hold most of the mouse events.
	drag: q("#drag"),
	// The mailman.
	mailman: q("#mailman"),
	// The window where you set the mail's recipient.
	msg_write: q("#msg_write"),
	// The input for the mail's recipient's name.
	msg_write_input: q("#msg_write_input"),
	// The close button.
	msg_write_close: q("#msg_write .btn")[0]
};

// Call all the relevant images so they'll be easily found here.
const img = {
	// The controls (play, resume, pause, etc).
	ctrl: q("#ctrl img")
};

// The array of addresses that can be found in the loaded .csv file.
let array;
// This array will be the one to be sorted, preserving the true array.
let array_tag;
// Used by the sorter. Do not touch.
let array_dump = {};
/* All the addresses selected in the message selection will be here.
   Each entry is a combination of the div element, the address
   location, and the date & time it was created.
*/
let address_selected = [];
/* This is used whenever the user is writing a mail. The variable's
   name pretty much suggests what it's for.
*/
let address_target;
// This will indicate if the screen is being dragged by the mouse.
let drag;
// This will indicate how far was the screen drag from the origin.
let drag_pos = [0, 0];
// This will indicate the screen's zoom factor.
let space_scale = 10; // range of 4 to 20.
// This will indicate which post office will the mailman start from.
let office_selected;
// The mailman's position in Vector[2].
let mailman_pos = new lemon.Vector([0, 0]);


//-- Mailman. Setup portion for the mailman's functions. --//

/**
 * Move the mailman towards the given Vector[2].
 * @param Vector[2] v - 2D vector.
**/
function mailman_move(v) {
	// Get direction from the 2 vector[2]s.
	let dir = new lemon.Vector([
		v[0] - mailman_pos[0],
		v[1] - mailman_pos[1]
	]);

	// Set position.
	mailman_pos = new lemon.Vector(v);
	e.mailman.style.left = v[0]*100 + "px";
	e.mailman.style.top = v[1]*100 + "px";
	e.mailman.style.transform = "translate(-50%, -50%) rotate(" +
		Math.atan2(dir[1], dir[0])/Math.PI*180 + "deg)";

	// Make the mailman visible.
	e.mailman.removeAttribute("hidden");
}


//-- Controls Section. Setup portion for the controls. --//

// This will indicate if the speed slider's ball is being dragged.
let div_speed_drag;

/**
 * Set the buttons' state. Setting to null will not change it.
 * 0 = Disabled; 1 = Enabled; null = No Changes
 * @param Integer a - Play button.
 * @param Integer b - Resume button.
 * @param Integer c - Pause button.
 * @param Integer d - Rewind button.
 * @param Integer e - Array button. Mail-writing window.
 * @param Integer f - Sort button.
**/
function ctrl_set(a, b, c, d, e, f) {
	let l = [a, b, c, d, e, f];

	for (let i in l)
		if (l[i] != null)
			if (l[i])
				img.ctrl[i].removeAttribute("disabled");
			else
				img.ctrl[i].setAttribute("disabled", 1);
}

/**
 * This will be called whenever the speed slider's ball is dragged.
 * @param Object event - The mouse event's information summary.
**/
function div_speed_fn(event) {
	// Only do do something if the ball is being dragged.
	if (div_speed_drag) {
		// Calculate by 32 pixels (We don't need extreme precision).
		let i = Math.max(Math.min(Math.floor(
			(event.x - e.speed.offsetLeft)/32
		), 4), 0);

		// Move the ball.
		e.speed_ball.style.left = i*40 - 12 + "px";

		i = speed[i];

		/* Update the animation's 'step' delay. 'Step' means when the
		   'mailman' moves to another point, or arranges his mails.
		   This will make the mailman do 1 'step' after x seconds.
		*/
		stepper.delay = i;

		i *= 0.00075;

		// Make the mailman's movements change as well.
		e.mailman.style.transition = "top " + i +
			"s linear, left " + i + "s linear," + " transform 0.2s";
	}
}

// See if the mouse is being held down on the speed slider.
e.speed.addEventListener("mousedown", event => {
	// Make sure it's the left mouse button.
	if (!event.button) {
		// Tell the user that it started dragging.
		div_speed_drag = 1;

		// Update it ASAP.
		div_speed_fn(event);
	}
});

// See if a mouse button is no longer being held down.
document.addEventListener("mouseup", event => {
	// Make sure it's the left mouse button.
	if (!event.button)
		// Tell the user it's no longer being dragged.
		div_speed_drag = null;
});

// Update whenever the user attempts to move the mouse.
document.addEventListener("mousemove", div_speed_fn);

function play_callback(i) {
	if (i == 1)
		ctrl_set(1, 0, 0, 1, 1);
}

// Play Button.
img.ctrl[0].addEventListener("click", _ => {
	reset();
	stepper.play(play_callback);

	ctrl_set(0, 0, 1, 1, 0, 0);
});

// Resume Button.
img.ctrl[1].addEventListener("click", _ => {
	stepper.play(play_callback);

	ctrl_set(0, 0, 1, null, 0);
});

// Pause Button.
img.ctrl[2].addEventListener("click", _ => {
	stepper.playing = -1;

	ctrl_set(1, 1, 0, null, 1);
});

// Rewind Button.
img.ctrl[3].addEventListener("click", _ => {
	reset();

	ctrl_set(1, 0, 0, 0, 1, 1);
});

// Array Button. Opens the mail creation window.
img.ctrl[4].addEventListener("click", _ => {
	e.msg_sel.removeAttribute("hidden");
});

// Sort Button. Change sorting priority.
img.ctrl[5].addEventListener("click", _ => {
	stepper.sorttime = !stepper.sorttime;

	img.ctrl[5].src = stepper.sorttime ?
		"assets/img/sorttime.png" : "assets/img/sortdist.png";
});


//-- Mail Recipient Window. Set the recipient's name. --//

function msg_write_show() {
	let name = name_struct[Math.floor(
		Math.random()*name_struct.length
	)];

	msg_write.removeAttribute("hidden");
	msg_write_input.setAttribute("placeholder", name);
	msg_write_input.focus(); // Focus immediately.
}

// Make it so that pressing enter will submit it.
e.msg_write_input.addEventListener("keydown", event => {
	let address = address_target;

	// Make sure there's actually an address to go to.
	if (event.keyCode == 13 && address) {
		// Grab the placeholder instead if empty.
		let name = e.msg_write_input.value ? e.msg_write_input.value :
			e.msg_write_input.getAttribute("placeholder");

		let t = new Date();
		let div = q("!div");
		div.innerHTML = name + "; " + t.toLocaleString() + "; " +
			address.from.split(" ").map(v => v[0]).join("") + "; " +
			address.magnitude;

		// Make it so that it emphasizes the address on hover.
		address.hover(div);

		address_selected.push({
			div: div,
			time: t.getTime(), // Convert to seconds.
			address: address
		});

		// Show the point and line towards post office.
		address.pnt.removeAttribute("hidden");
		address.path.removeAttribute("hidden");

		// Enable confirm button.
		e.msg_sel_btn[0].removeAttribute("disabled");

		// Hide this window.
		e.msg_write.setAttribute("hidden", 1);
	}
});

// Close button.
e.msg_write_close.addEventListener("click", _ =>
	e.msg_write.setAttribute("hidden", 1)
);


//-- Load Section. Setup portion for the file-loading functions. --//

/**
 * Resets the arrays to when it hasn't played yet.
**/
function reset() {
	e.msg.innerHTML = "";
	// Draw the message list.
	e.msg_main.innerHTML = "<div>Unsorted</div>";

	e.msg.appendChild(e.msg_main);

	// Remove the stepper's key and playlist.
	stepper.key = null;
	stepper.playlist = [];

	// Clear our the dump.
	array_dump = [];

	// Clear out the tag list.
	array_tag = [];

	for (let i in address_selected) {
		e.msg_main.appendChild(address_selected[i].div);
		stepper.ctrl(i, 0, 0);
		stepper.ctrl(i, 1, Number(i));
		array_tag.push(i);
	}
}

/**
 * Load the data in string format.
 * @param String str - the data (supposedly coming from a .csv file).
**/
function load(str) {
	// Make sure it's not playing.
	if (stepper.playing != -1) return;

	// Make a map out of the file's contents (assets/js/map.js).
	array = map(str);

	// Reset stepper.
	reset();

	// Reset controls.
	ctrl_set(0, 0, 0, 0, 1, 1);

	// Clear message list.
	e.msg_sel_tbody.innerHTML = "<tr head>" +
		"<td>Location</td>" +
		"<td>Destination</td>" +
		"<td>Distance</td>" +
		"</tr>";

	// Clear workspace.
	e.space.innerHTML = "";

	// Reset the mailman.
	e.mailman.setAttribute("hidden", 1);
	e.space.appendChild(e.mailman);

	// Reset user selections.
	address_selected = [];
	office_selected = null;

	// Iterate through the locations.
	for (let x in array) {
		// Create the circles on the map.
		let pnt = q("!div");
		let tooltip = "<label center>" + x + "</label>" + (
			array[x].from ?
			"<br><br><label center>" +
			array[x].from +
			"</label>" :
			""
		);
		array[x].pnt = pnt;
		// Plot it on the screen based on it's position.
		pnt.style.left = array[x].position[0]*100 + "px";
		pnt.style.top = array[x].position[1]*100 + "px";

		e.space.appendChild(pnt);

		// If it actually came from something (from Post Office).
		if (array[x].from) {
			// Draw a line from post office to this location.
			let path = q("!path");
			array[x].path = path;
			// Nasty maths. Not for the faint of heart.
			let dir = new lemon.Vector([
				array[array[x].from].position[0] -
				array[x].position[0],
				array[array[x].from].position[1] -
				array[x].position[1]
			]);
			path.style.left = array[x].position[0]*100 + "px";
			path.style.top = array[x].position[1]*100 + "px";
			path.style.width = dir.magnitude()*100 + "px";
			path.style.transform = "rotate(" + Math.atan2(
				dir[1], dir[0]
			)/Math.PI*180 + "deg)";

			/* Make these guys hidden (Except post offices).
			   We'll make it visible if there's a message to be
			   sent to that location.
			*/
			pnt.setAttribute("hidden", 1);
			path.setAttribute("hidden", 1);
			e.space.appendChild(path);

			/* This will be used as a way to show where the address
			   is visually.
			*/
			array[x].hover = v => {
				tooltip_new(v, tooltip);

				v.addEventListener("mouseenter", _ => {
					path.style.boxShadow = "0 0 0 4px #fff";

					pnt.setAttribute("hover", 1);
				});

				v.addEventListener("mouseleave", _ => {
					path.style.boxShadow = "";

					pnt.removeAttribute("hover");
				});
			};

			array[x].hover(pnt);

			/* Create an entry of the address so that the user
			   knows that you can send a mail to this location.
			*/
			let tr = q("!tr");
			array[x].tr = tr;

			/* Append [Post Office, Destination, Distance], in that
			   order.
			*/
			let index = [array[x].from, x, array[x].magnitude];

			for (let i in index) {
				let td = q("!td");
				td.innerHTML = index[i];

				tr.appendChild(td);
			}

			// Toggle location visibility when clicked.
			tr.addEventListener("click", _ => {
				// Prompt user for recipient's name.
				address_target = array[x];

				msg_write_show();
			});

			e.msg_sel_tbody.appendChild(tr);
		} else {
			/* It doesn't have a post office to go from. This is
			   a post office!
			*/
			tooltip_new(pnt, tooltip); // Hook tooltip listener.

			pnt.setAttribute("post", 1); // Mark as post office.

			/* Make it so that you can select which post office
			   will the mailman start from. By default, none are
			   selected, which the user can't start without
			   selecting.
			*/
			pnt.addEventListener("click", _ => {
				// Only let the user select when not playing.
				if (!stepper.playlist.length) {
					// Deselect previously selected post office.
					(office_selected ?
					array[office_selected]
						.pnt.removeAttribute("selected")
					: 0);

					office_selected = x;
					pnt.setAttribute("selected", 1);

					// Move the mailman to that location.
					mailman_move(array[office_selected].position);

					// Allow the user to play!
					ctrl_set(1);
				}
			});
		}

		// Hide the 'drop a file' message.
		e.dropdown.setAttribute("hidden", 1);
		// Show the 'select addresses to send to' window.
		e.msg_sel.removeAttribute("hidden");
	}
}

/**
 * Disabled load-via-pasting since it also affects other text-related
 * stuff. It works, though.

document.addEventListener("paste", event => load(
	event.clipboardData.getData("Text")
));
**/

// File dropped on the screen.
document.addEventListener("drop", event => {
	/* Stop the browser from doing its automatic things. Tell it that
	   we'll take it from here.
	*/
	event.stopPropagation();
	event.preventDefault();

	let file = event.dataTransfer.items[0];

	if (file) if (file.type == "application/vnd.ms-excel") {
		/* Just in case if the user drops more than 1 files, just
		   take the first one.
		*/
		file.getAsFile(file => {
			// Summon the file reader!
			let reader = new FileReader();
			reader.onload = event => load(event.target.result);

			// Start reading the file synchronously.
			reader.readAsText(file);
		});
	} else if (file.type == "text/plain")
		file.getAsString(load);
});

// Explicitly change the file dragging behavior.
document.addEventListener("dragover", event => {
	// Stop the browser from doing its automatic things.
	event.stopPropagation();
	event.preventDefault();
	// Make the cursor look like its making a copy of the file.
	event.dataTransfer.dropEffect = "copy";
});


//-- Message Selection Section. Contains the button functions. --//

// Confirm Button. Hide the 'messages' window.
e.msg_sel_btn[0].addEventListener("click", _ => {
	// Hide the 'messages' window.
	e.msg_sel.setAttribute("hidden", 1);

	// Reset everything to a fresh start.
	reset();

	// Reset controls.
	ctrl_set(0, 0, 0, 0, 1);
});

// Reset Button. Clear all selected addresses.
e.msg_sel_btn[1].addEventListener("click", _ => {
	// Iterate through all the selected addresses.
	for (let i in address_selected) {
		// Hide 'em.
		address_selected[i].address.pnt.setAttribute("hidden", 1);
		address_selected[i].address.path.setAttribute("hidden", 1);
	}

	// Fresh new array.
	address_selected = [];

	// Don't let the user continue without selecting anything.
	e.msg_sel_btn[0].setAttribute("disabled", 1);
});


//-- Screen Behaviour Section. Make the mouse responsive. --//

// Set 'drag' to 'true' if left mouse button is held down.
e.drag.addEventListener("mousedown", event => drag = !event.button);

// Make mouse wheel zoom in/out.
e.drag.addEventListener("wheel", event => {
	// See if mouse wheel was moved forward or backward.
	let n = event.deltaY < 0 ? -1 : 1;
	// Get current screen scale
	let i = space_scale;
	// Update it.
	space_scale = Math.max(4, Math.min(20,
		space_scale + n
	));

	// No changes? Do nothing.
	if (i == space_scale) return;

	// Divide it by 10. We scale it by percent (0.4 to 2.0).
	i = space_scale/10;
	// Slightly move the screen when zooming.
	drag_pos[0] += (drag_pos[0]*2 - innerWidth)*0.05*n;
	drag_pos[1] += (drag_pos[1]*2 - innerHeight)*0.05*n;
	e.space.style.left = drag_pos[0];
	e.space.style.top = drag_pos[1];
	// Rescale.
	e.space.style.transform = "scale(" + i + ", " + i + ")";
});

// Make the mouse dragging move the screen.
document.addEventListener("mousemove", event => {
	// Only do this if left mouse button is held down.
	if (drag) {
		drag_pos[0] += event.movementX;
		drag_pos[1] += event.movementY;

		e.space.style.left = drag_pos[0];
		e.space.style.top = drag_pos[1];
	}
})

// Stop drag if left mouse button is released.
document.addEventListener("mouseup", event => {
	if (!event.button)
		drag = null;
});