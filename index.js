const elem = document.createElement.bind(document),
	body = document.body,
	getId = document.getElementById.bind(document),
	getTag = document.getElementsByTagName.bind(document),
	getClass = document.getElementsByClassName.bind(document);

const div = {
	arr: getId("arr"),
	tag: getId("tag"),
	wrap: getId("wrap")
}

const img = {
	ctrl: getId("ctrl").getElementsByTagName("img")
}

const fill_width = 320;

// Collection of the array elements' 'True integer' value.
let val_list = [];
// Collection of the array elements.
let arr_list = [];
// Collection of the tag elements.
let tag_list = [];
// Collection of the simulator's tag elements.
let sim_list = [];
let sim_list_swp;

/**
 * Tag list manipulation command.
 * @param Integer i - The index in the tag list.
 * @param Integer flag - Command type.
 * 0 = Change state. val = state enumerator.
 * 1 = Move horizontal. val = css.left by percent.
 * 2 = Move vertical. val = css.top by percent.
 * @param Value val - The value to be used for the command.
**/
function ctrl(i, flag, val) {
	switch(flag) {
		case 0:
			tag_list[i].setAttribute("state", val);
			break;
		case 1:
			tag_list[i].style.left = val*100 + "%";
			break;
		case 2:
			tag_list[i].style.top = val*100 + "%";

			if (sim_list_swp)
				arr_list[i].style.top = val*100 + "%";
	}
}

function arr_set(list) {
	// Clean up previous elements.
	for (let i in arr_list) div.arr.removeChild(arr_list[i]);
	for (let i in tag_list) div.tag.removeChild(tag_list[i]);

	// Re-new list.
	val_list = [];
	arr_list = [];
	tag_list = [];

	let width = 0;
	let low;
	let high = 0;

	// Calculate.
	for (let i in list) {
		// Get the 'True Integer' value for each element.
		val_list.push(
			typeof(list[i]) == "number" ? list[i] :
			typeof(list[i]) == "string" ? string_to_int(list[i]) :
			array_to_int(list[i])
		);

		// Get the lowest and highest value.
		if (!low) {
			low = val_list[i];
			high = val_list[i];
		} else {
			low = Math.min(low, val_list[i]);
			high = Math.max(high, val_list[i]);
		}

		// Calculate the longest width.
		div.wrap.innerHTML = list[i];
		width = Math.max(div.wrap.offsetWidth, width);
	}

	if (low == high)
		low = 0; // All same length.
	else
		high = high - low; // Flatten.

	// Move the tag's initial position to the end of the array elements.
	div.tag.style.left = 8 + 24 + width + fill_width + "px";

	// Build.
	for (let i in list) {
		let n = Number(i) + 1;

		let cont = elem("div");
		cont.style.top = i*100 + "%";
		cont.style.width = (32 + 24 + width +
			(val_list[i]-low)/high*fill_width) + "px";

		let index = elem("div");
		index.className = "index";
		index.innerHTML = n;

		let label = elem("div");
		label.className = "label";
		label.innerHTML = list[i];

		let tag = elem("tag");
		tag.className = "tag";
		tag.innerHTML = n;
		tag.style.top = i*100 + "%";

		cont.appendChild(index);
		cont.appendChild(label);

		div.tag.appendChild(tag);
		div.arr.appendChild(cont);

		arr_list.push(cont);
		tag_list.push(tag);
	}
}

/**
 * Sort the array.
 * @param Function fn - The sorting algorithm to be used.
**/
function arr_start(fn) {
	// Reset position.
	for (let i in tag_list) {
		tag_list[i].style.top = i*100 + "%";
		tag_list[i].style.left = "";
	}

	let tag = [];

	for (let i in arr_list)
		tag.push(i);

	sim_list = fn(
		val_list, // Dummy tag list.
		null, // No need to re-point the value.
		null, // Length limiter to null.
		ctrl, // Element control.
		(tag, state) => {
			if (state) {
				img.ctrl[0].setAttribute("disabled", 1);
				img.ctrl[1].setAttribute("disabled", 1);
				img.ctrl[2].removeAttribute("disabled");
			}
		}
	);
}


//-- Controls. --//

// Pause.
img.ctrl[0].addEventListener("click", event => {
	if (event.preventDefault) event.preventDefault();
	if (img.ctrl[0].getAttribute("disabled") || !step_config.play) return;

	step_config.play = 0;

	img.ctrl[0].setAttribute("disabled", 1);
	img.ctrl[1].removeAttribute("disabled");
	img.ctrl[2].removeAttribute("disabled");
});

// Resume.
img.ctrl[1].addEventListener("click", event => {
	if (event.preventDefault) event.preventDefault();
	if (img.ctrl[1].getAttribute("disabled")) return;

	step_config.play = 1;

	step_config.resume();

	img.ctrl[0].removeAttribute("disabled");
	img.ctrl[1].setAttribute("disabled", 1);
	img.ctrl[2].setAttribute("disabled", 1);
});

// Play.
img.ctrl[2].addEventListener("click", event => {
	if (event.preventDefault) event.preventDefault();
	if (img.ctrl[2].getAttribute("disabled")) return;

	for (let i in arr_list)
		arr_list[i].style.top = i*100 + "%";

	step_config.play = 1;
	arr_start(fn_sort_insertion);

	img.ctrl[0].removeAttribute("disabled");
	img.ctrl[1].setAttribute("disabled", 1);
	img.ctrl[2].setAttribute("disabled", 1);
});

// Align.
img.ctrl[3].addEventListener("click", event => {
	if (event.preventDefault) event.preventDefault();
	if (img.ctrl[3].getAttribute("disabled")) return;

	sim_list_swp = !sim_list_swp;

	if (sim_list_swp) {
		img.ctrl[3].setAttribute("src", "assets/img/default.png");

		for (let i in sim_list)
			arr_list[sim_list[i]].style.top = i*100 + "%";
	} else {
		img.ctrl[3].setAttribute("src", "assets/img/align.png");

		for (let i in arr_list)
			arr_list[i].style.top = i*100 + "%";
	}
});

//-- Shenanigans. --//

let bob = ["The", "quick", "brown", "fox", "jumped", "over", "the", "lazy", "dog."];

arr_set(bob);

/*
let textarea = document.getElementsByTagName("textarea")[0];

textarea.addEventListener("keydown", function(event) {
	if (event.keyCode == 9 || event.which == 9) {
		event.preventDefault();

		this.value = this.value.substr(0, this.selectionStart) +
			"\t" + this.value.substr(this.selectionEnd);
	}
});
*/