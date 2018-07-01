/**
 * Insert the value in the ordered array via binary search. Also works
 * if empty. If a similar value exists, it will be added to the left-most.
 * @param Object arr - The array. Should be an ordered list, otherwise
 * unintended things might happen.
 * @param Value v - The value to be added. Can be anything, so long as it
 * can be used with the measurement operators.
 * @param Function(Object element) format - If the array is filled
 * with Objects, you can use this to manually direct which value will be
 * used. The given paramater is the object inside the array and the
 * function needs to return the value to be assessed.
 * @param Integer len - If supplied, searching will be limited to this
 * length or the array's length, whichever fits properly.
 * @return Integer - The index where the value was inserted to.
**/
function insert_binary(arr, v, format, len) {
	if (len == null)
		len = arr.length;
	else
		len = Math.max(len, arr.length, 0);

	format = format ? format : v => v;

	// See if we don't really need to search at all to avoid wasting time.
	if (format(arr[0]) >= v || !len) {
		arr.splice(0, 0, v);

		return 0; // Empty or lowest.
	} else if (format(arr[arr.length-1]) <= v)
		return arr.push(v); // Highest.

	let l = 0, // Low. This is where the search should start at.
		h = len; // High. This is the total length of the array.

	// Repeat until length is 0.
	while (h > 0) {
		// Grab the longer half. This is the left side.
		let i = Math.ceil(h/2);
		// Grab the shorter half. This is the right side.
		h = Math.floor(h/2);

		// See if the middle element (If 2 middle elements, the left one).
		if (format(arr[l+h]) < v)
			l += i; // Left one is smaller, go to the right side.
	}

	// Insert it.
	arr.splice(l+h, 0, v);

	return l+h; // The index of the inserted value.
}

/**
 * Tag sort via insertion algorithm. Neat stuff yo.
 * @param Object arr - The array. Will not be modified.
 * @param Object tag - The list of tags. Should be the same length as
 * the array with values having consecutive order starting from 0,
 * otherwise might not work as intended. This will modify the tag array.
 * You have been warned. Tag will be created if not supplied.
 * @param Function(Object element) format - If the array is filled
 * with Objects, you can use this to manually direct which value will be
 * used. The given paramater is the object inside the array and the
 * function needs to return the value to be assessed.
 * @param Integer len - If supplied, searching will be limited to this
 * length or the array's length, whichever fits properly.
**/
function sort_tag_insertion(arr, tag, format, len) {
	if (!len)
		len = arr.length;
	else
		len = Math.max(len, arr.length, 0);

	format = format ? format : v => v;

	if (!tag) {
		tag = [];

		for (let k in arr) tag.push(k);
	}

	// There's nothing in the array, silly!
	if (!len) return;

	// Repeat until thoroughly traversed except for last one.
	for (let i = 0; i < len-1; i++) {
		// The current element.
		let x = i;
		// The next element. This is what we'll be inserting.
		let k = tag[x+1];

		// Move element until finding a smaller element or nothing left.
		while (x >= 0 && format(arr[tag[x]]) > format(arr[k])) {
			tag[x+1] = tag[x]; // Overwrite next element.
			x--; // Get previous element.
		}

		tag[x+1] = k; // Insert.
	}

	return tag;
}


/*-- Top area contains the unmodified algorithm.
 * Below contains the hard-coded functions specifically for this
 * application.
--*/

let step_delay = 300;
// This will contain the controls for stopping or resuming the application.
let step_config = {
	play: 1, // 0 = Stop; 1 = Playing
	resume: () => {} // Placeholder. This will be replaced constantly.
};

function step(fn) {
	setTimeout(fn, step_delay);
}

/**
 * Insertion sort but ran by steps. The array itself will not be modified.
 * 'callback' will be called when done or paused.
**/
function fn_sort_insertion(arr, format, len, ctrl, callback) {
	// Init.
	if (!len)
		len = arr.length;
	else
		len = Math.max(len, arr.length, 0);

	format = format ? format : v => v;
	callback = callback ? callback : () => {};


	if (!len) return; // There's nothing in the array, silly!

	let tag = [];

	for (let i in arr) {
		tag.push(Number(i)); // Make a tag list for the array.
		ctrl(i, 0, i == 0 ? 0 : 1); // Set all to not sorted state.
	}

	let i = 0;

	let nxt = () => step(() => {
		step_config.resume = nxt;

		if (!step_config.play)
			return callback(tag, 0);

		if (!(i < len-1))
			return ctrl(0, 0, 0) || callback(tag, 1); // Fin.

		// The current element.
		let x = i;
		// The next element. This is what we'll be inserting.
		let k = x+1;

		ctrl(tag[x], 0, 3);
		ctrl(tag[x], 1, 1);
		ctrl(k, 0, 2);
		ctrl(k, 1, 1);

		let nxt2 = () => step(() => {
			step_config.resume = nxt2;

			if (!step_config.play)
				return callback(tag, 0);

			if (!(x >= 0 &&
				format(arr[tag[x]], tag[x]) > format(arr[k], k))) {
				ctrl(k, 0, 0);
				ctrl(k, 1, 0);

				if (tag[x] != null) {
					ctrl(tag[x], 0, 0);
					ctrl(tag[x], 1, 0);
				}

				tag[x+1] = k; // Insert.

				i++;

				return nxt();
			}

			ctrl(k, 2, x);
			ctrl(tag[x], 0, 0);
			ctrl(tag[x], 1, 0);
			ctrl(tag[x], 2, x+1);

			if (x > 0) {
				ctrl(tag[x-1], 0, 3);
				ctrl(tag[x-1], 1, 1);
			}

			let n = tag[x+1];
			tag[x+1] = tag[x]; // Overwrite next element.
			tag[x] = n;
			x--; // Get previous element.

			nxt2();
		});


		nxt2();
	});

	nxt();

	return tag;
}

/**
 * Convert string to integer.
 * @param String v - The string.
 * @return Integer - The result.
**/
function string_to_int(v) {
	let n = 0;

	for (let i in v) {
		n += v.charCodeAt(i);
	}

	return n;
}

/**
 * Combines all elements inside the array into an integer.
 * @param Array v - The array.
 * @return Integer - The result.
**/
function array_to_int(v) {
	let n = 0;

	for (let i in v) {
		if (typeof(v[i]) == "object")
			n += array_to_int(v[i]);
		else if (typeof(v[i]) == "string")
			n += string_to_int(v[i]);
		else
			n += v[i];
	}

	return n;
}