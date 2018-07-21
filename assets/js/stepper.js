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
	let v = array_tag.unsorted.length ? array_tag.unsorted :
		array_tag.sorted.length ? array_tag.sorted : 0;

	// See if there's still something left.
	if (v) {
		let x = array_tag.unsorted.length ?
			array_tag.sorted.length : 0;
		// Dequeue a mail (javascript calls it 'shift').
		let i = v.shift();
		// Get the post office it belongs to.
		let from = address_selected[i].address.from;

		for (let i in v)
			stepper.ctrl(v[i], 1, Number(i) + x);

		// See if we need to add an entry for the post office.
		if (!array_tag.dump[from]) {
			array_tag.dump[from] = [];
			array_tag.buffer[from] = 0;

			/* Make an entry for the post office order array.
			   This will dictate which one will be prioritized first.
			*/
			if (array_tag.order.indexOf(from) == -1)
				array_tag.order.push(from);

			// Make an entry for the containers array.
			let div = q("!div");
			div.innerHTML = "<div>" +
				from.split(" ").map(v => v[0]).join("") +
				"</div>";

			e.msg.appendChild(div);
			array_tag.div[from] = div;
		}

		if (v == array_tag.unsorted)
			array_tag.buffer[from]++;

		// Push the mail to the designated post office array.
		let n = array_tag.dump[from].push(i);

		stepper.ctrl(i, 1, n - 1);
		stepper.ctrl(i, 2, array_tag.div[from]);
	} else {
		let i = array_tag.dump[array_tag.order[0]] ? 0 : 1;
		let k = array_tag.order[i];

		// Make preparations for the 2nd part.
		stepper.key = [
			// Currently selected post office for sorting.
			i,
			// 'Element A' to be compared
			1,
			// 'Element B' to be compared.
			array_tag.dump[k][0]
		];

		stepper.ctrl(array_tag.dump[k][0], 0, 2);

		if (array_tag.dump[k].length > 1)
			stepper.ctrl(array_tag.dump[k][1], 0, 3);

		return 1; // Finished
	}
};

/**
 * This arranges the messages in 'descending' order, separated by
 * post offices.
**/
stepper.arrange = _ => {
	/* We'll sort with reverse bubble-like sort (It's reversed just
	   for the animation).
	*/
	let k = stepper.key;
	let c = stepper.ctrl;
	let u = array_tag.buffer;
	let o = array_tag.order;
	let d = array_tag.dump;

	// Point to the post office's name.
	let p = o[k[0]];
	// The next element from the selected element.
	let i = k[1];
	// The selected post office array.
	let v = d[p];

	// See if there's something to compare with.
	if (i < v.length) {
		let a = address_selected[k[2]]; // Selected value.
		let b = address_selected[v[i]]; // Next value.

		k[1]++;

		if (stepper.sorttime) {
			a = a.time;
			b = b.time;
		} else {
			a = a.address.magnitude;
			b = b.address.magnitude;
		}

		// See if the selected value has the higher value.
		if (a > b) {
			/* Move the next value down by 1 position (This is
			   where we found the selected value, or the previously
			   compared value).
			*/
			v[i-1] = v[i];

			c(v[i-1], 0, i-1 >= u[p] ? 0 : 1);
			c(v[i-1], 1, i-1);
			c(k[2], 1, i);

			if (i + 1 < v.length)
				c(v[i+1], 0, 3);
		} else {
			/* A higher value was found. Select that instead.
			   Put the previously selected value down as
			   replacement.
			*/
			v[i-1] = k[2];
			k[2] = v[i];

			if (i < u[p]) {
				c(v[i-1], 0, i-1 >= u[p] ? 0 : 1);
				c(k[2], 0, 2);

				if (i + 1 < v.length)
					c(v[i+1], 0, 3);
			} else
				k[1] = -1;
		}
	}

	if (k[1] == v.length || k[1] == -1) {
		v[i] = k[2];

		// Go back to start.
		k[1] = 1;

		// Decrement buffer.
		u[p]--;

		// Mark as sorted.
		c(v[i-1], 0, 0);
		c(v[i], 0, 0);

		// See if there's still unsorted mails.
		if (u[p] > 0) {
			// Grab the first element again.
			k[2] = d[p][0];

			c(k[2], 0, 2);

			if (v.length > 1)
				c(d[p][1], 0, 3);
		} else {
			// Go to the next post office.
			p = o[k[0]++ + 1];

			// See if that was the last post office.
			if (k[0] == o.length) {
				// Setup for the next step.
				stepper.key = d[o[0]] ? 0 : 1;

				d[o[stepper.key]].map(v => c(v, 0, 2));

				return 1;
			} else {
				// Create the next key.
				k[2] = d[p][0];

				c(k[2], 0, 2);

				if (d[p].length > 1)
					c(d[p][1], 0, 3);
			}
		}
	}
};

/**
 * Place everything back to the array.
**/
stepper.pour = _ => {
	let o = array_tag.order;
	let k = o[stepper.key];
	let s = array_tag.dump;
	let d = array_tag.div;

	// Extract array contents.
	let v = s[k];

	// Keep extracting until it's empty.
	if (v.length) {
		let i = v.shift();
		let n = array_tag.sorted.push(i);

		stepper.ctrl(i, 0, 0);
		stepper.ctrl(i, 1, n-1);
		stepper.ctrl(i, 2, e.msg_main);

		for (let i in v)
			stepper.ctrl(v[i], 1, Number(i));
	}

	// See if it's empty.
	if (!v.length) {
		e.msg.removeChild(d[k]);

		delete s[k];
		delete d[k];

		stepper.key++;

		if (stepper.key == o.length) {
			// Everything is done! Time to send the mails.
			stepper.key = null;

			// Dequeue the order once.
			o.shift();

			return 1;
		} else
			s[o[stepper.key]].map(v => stepper.ctrl(v, 0, 2));
	}
}

/**
 * The mailman's journey in an iterator.
**/
stepper.mailman = _ => {
	// Peek at the top element first.
	let s = array_tag.sorted;
	let v = address_selected[s[0]];

	if (!v || v.address.from != office_selected) {
		// See if there's still mails left.
		if (v) {
			// Go to the next post office.
			array[office_selected].pnt.removeAttribute("selected");
			office_selected = v.address.from;
			array[office_selected].pnt.setAttribute("selected", 1);
		}

		// No rest for the wicked.
		mailman_move(array[office_selected].position);

		return 1;
	} if (stepper.key) {
		stepper.key = null;

		mailman_move(array[office_selected].position);
	} else {
		s.shift(); // Dequeue.

		for (let i in s)
			stepper.ctrl(s[i], 1, Number(i));

		stepper.key = 1;

		mailman_move(v.address.position);
		e.msg_main.removeChild(v.div);
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

	if (stepper.playlist[i]())
		stepper.playlist.pop();

	if (!stepper.playlist.length) {
		stepper.playing = -1;

		return callback(1);
	}

	setTimeout(_ => (
		stepper.playing == tick && stepper.playlist.length ?
		stepper.play(callback, tick) : callback(0)
	), stepper.delay);
}