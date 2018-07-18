// Everything is connected so we can get variables from the others.

/**
 * This will hold all of the iterators (for loops in the form of
 * functions; not to be confused by recursive functions) that allows
 * nifty stuffs like pausing during the animation.
 * What the iterators iterate are 'imaginary' key frames for the
 * animation, which will be formulated along the way.
**/
let stepper = {
	// Delay between steps.
	delay: 300,
	// If the animation is playing.
	playing: -1,
	// This will contain which iterator should be ran. Right to left.
	playlist: [],
	// Counter evertime a function is called.
	step: 0,
	/* Make it so that it sorts by mail time creation instead of
	   distance from post office.
	*/
	sorttime: 0,
	// Used by the stepper. Don't touch.
	key: null
};

// Order is: deconstruct > arrange > pour.

/**
 * Used to manipulate the GUI.
**/
stepper.ctrl = (i, flag, v) => {
	if (!address_selected[i]) return;

	let elm = address_selected[i].div;

	switch(flag) {
		case 0: // Set state.
			elm.setAttribute("state", v);
			break;

		case 1: // Set Y.
			elm.style.top = 40*(v + 1) + 8 + "px";
			break;

		case 2: // Change parent.
			v.appendChild(elm);
			break;
	}
}

/**
 * This separates all by post offices.
**/
stepper.deconstruct = _ => {
	// Make an entry for the unsorted.
	if (!array_dump.unsorted)
		array_dump.unsorted = {};

	// See if there's still something left.
	if (array_tag.length) {
		// Pop a mail.
		let i = array_tag.pop();
		// Get the post office it belongs to.
		let from = address_selected[i].address.from;

		// See if we need to add an entry for the post office.
		if (!array_dump.unsorted[from]) {
			/* Make an entry for the post office order array.
			   This will dictate which one will be prioritized first.
			*/
			if (!array_dump.order)
				array_dump.order = [];

			array_dump.order.push(from);

			// Make an entry for the containers array.
			if (!array_dump.div)
				array_dump.div = {};

			let div = q("!div");
			div.innerHTML = "<div>" +
				from.split(" ").map(v => v[0]).join("") +
				"</div>";

			e.msg.appendChild(div);
			array_dump.div[from] = div;

			// Create the entry for the post office.
			array_dump.unsorted[from] = [];
		}

		// Push the mail to the designated post office array.
		let n = array_dump.unsorted[from].push(i);

		stepper.ctrl(i, 0, 1);
		stepper.ctrl(i, 1, n - 1);
		stepper.ctrl(i, 2, array_dump.div[from]);
	} else return 1; // Finished
};

/**
 * This arranges the messages in 'descending' order, separated by
 * post offices.
**/
stepper.arrange = _ => {
	/* The key for the arranger. These are like a UID for each
	   animation frames.
	*/
	let k = stepper.key;

	// See the 'for loop' below for the key generator.
	if (k) {
		/* We'll sort with reverse bubble-like sort (It's reversed just
		   for the animation).
		*/

		// The next element from the selected element.
		let i = k[1];
		// The selected post office array's name.
		let loc = k[0];
		// The selected post office array.
		let v = array_dump.unsorted[loc];

		// See if we've completely ran through the entire array.
		if (i == v.length) {
			/* Put the value we've selected at the last element.
			   This is assumed to be the highest value, since we've
			   compared everything with it.
			*/
			v[i-1] = k[2];
			// Get rid of the key to start again.
			stepper.key = null;
		} else {
			let a = address_selected[k[2]]; // Selected value.
			let b = address_selected[v[i]]; // Next value.

			if (stepper.sorttime) {
				a = a.time;
				b = b.time;
			} else {
				a = a.address.magnitude;
				b = b.address.magnitude;
			}

			// See if the selected value has the higher value.
			if (a < b) {
				/* Move the next value down by 1 position (This is
				   where we found the selected value, or the previously
				   compared value).
				*/
				v[i-1] = v[i];

				stepper.ctrl(v[i], 0, 1);
				stepper.ctrl(v[i], 1, i-1);
				stepper.ctrl(k[2], 1, i);

				if (v[i+1])
					stepper.ctrl(v[i+1], 0, 3);
			} else {
				/* A higher value was found. Select that instead.
				   Put the previously selected value down as
				   replacement.
				*/
				v[i-1] = k[2];
				k[2] = v[i];

				stepper.ctrl(v[i-1], 0, 1);
				stepper.ctrl(k[2], 0, 2);
				stepper.ctrl(k[2], 1, i);

				if (v[i+1])
					stepper.ctrl(v[i+1], 0, 3);
			}

			// Keep counting until reaching the end.
			k[1]++;
		}

		/* Key was removed. This is most likely we found the lowest
		   value.
		*/
		if (!stepper.key) {
			// Make an entry for the 'sorted' post offices.
			if (!array_dump.sorted)
				array_dump.sorted = [];

			// Make an entry for the 'sorted' mails.
			if (!array_dump.sorted[loc])
				array_dump.sorted[loc] = [];

			/* Grab the highest value (It's the last element since
			   we deliberately moved it to the last element.) then
			   push it to the sorted array, making a
			   'highest to lowest' sorting.
			*/
			let n = v.pop();
			array_dump.sorted[loc].unshift(n);

			stepper.ctrl(n, 0, 0);
		}

		// Cut out from here since we don't want to spam keys.
		return null;
	}

	// Grab 1 post office to sort.
	for (let i in array_dump.unsorted) {
		let v = array_dump.unsorted[i];

		// Make sure it has mails in it.
		if (v.length) {
			// Write down the key for it.
			stepper.key = [i, 1, v[0]];

			stepper.ctrl(v[0], 0, 2);

			if (v[1])
				stepper.ctrl(v[1], 0, 3);

			return null; // We only need 1.
		} else
			// Get rid of it. It's empty.
			delete array_dump.unsorted[i];
	}

	return 1; // Finished
};

/**
 * Place everything back to the array.
**/
stepper.pour = _ => {
	let k = stepper.key;
	let o = array_dump.order;
	let s = array_dump.sorted;

	// See if there's no key yet.
	if (!k) {
		// Write key.
		stepper.key = [0, -1];

		// Change label to 'Sorted'.
		e.msg_main.innerHTML = "<div>Sorted</div>";

		for (let i in s[o[0]])
			stepper.ctrl(s[o[0]][i], 0, 2);
	} else if (k[1] == 1) {
		// Extract array contents.
		let v = s[k[0]];

		// Keep extracting until it's empty.
		if (v.length) {
			let i = v.pop();
			let n = array_tag.push(i);

			stepper.ctrl(i, 0, 0);
			stepper.ctrl(i, 1, n-1);
			stepper.ctrl(i, 2, e.msg_main);
		}

		if (!v.length) {
			k[1] = 0;

			if (array_dump.div[k[0]]) {
				e.msg.removeChild(array_dump.div[k[0]]);

				delete array_dump.div[k[0]];
			}
		}
	} else if (!k[1]) {
		// Iterate through all remaining post offices.
		if (o.length) {
			// Grab the last element.
			k[0] = o.pop();
			k[1] = 1;

			for (let i in s[k[0]])
				stepper.ctrl(s[k[0]][i], 0, 2);
		} else
			return 1; // Finished
	} else if (o[k[0]] == office_selected) {
		// Found the starting post office.
		k[0] = o[k[0]];
		k[1] = 1;
	} else if (k[0] == o.length - 1) {
		// No mails for the starting post office.
		k[0] = k[1] = 0;

		for (let i in s[o[0]])
			stepper.ctrl(s[o[o.length-1]][i], 0, 0);
	} else {
		// Keep counting until everything is transfered.
		k[0]++;

		for (let i in s[o[k[0]]])
			stepper.ctrl(s[o[k[0]]][i], 0, 2);

		for (let i in s[o[k[0]-1]])
			stepper.ctrl(s[o[k[0]-1]][i], 0, 0);
	}
}

/**
 * The mailman's journey in an iterator.
**/
stepper.mailman = _ => {
	if (stepper.key) {
		let v = address_selected[stepper.key];
		stepper.key = null;

		mailman_move(v.address.position);
		e.msg_main.removeChild(v.div);

		for (let i in array_tag)
			stepper.ctrl(array_tag[i], 1, Number(i));
	} else if (array_tag.length) {
		stepper.key = array_tag.shift();

		let v = address_selected[stepper.key].address;

		mailman_move(array[v.from].position);
	} else {
		if (office_selected)
			mailman_move(array[office_selected].position);

		return 1;
	}
}

stepper.play = (callback, tick) => {
	callback = callback ? callback : _ => {};

	if (!stepper.playlist.length) {
		stepper.step = 0;
		stepper.playlist = [
			stepper.mailman,
			stepper.pour,
			stepper.arrange,
			stepper.deconstruct
		];
	}

	if (tick == null)
		tick = stepper.playing = Date.now();

	let i = stepper.playlist.length - 1;
	stepper.step++;

	if (stepper.playlist[i]()) {
		stepper.key = null;

		stepper.playlist.pop();
	}

	if (!stepper.playlist.length) {
		stepper.playing = -1;

		return callback(1);
	}

	setTimeout(_ => (
		stepper.playing == tick && stepper.playlist.length ?
		stepper.play(callback, tick) : callback(0)
	), stepper.delay);
}