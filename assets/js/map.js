/**
 * Map creation. Create a map out of a .csv file, assuming it has
 * the 'proper' (Post Office, From, To, Distance; in that order)
 * format. The first one is ignored since all of which are coming
 * from the post office.
 * @param String src - The unparsed .csv string bundle.
 * @return Object - A list of all of the locations found within the
 * .csv file, along with their positions (and their post offices with
 * distance).
**/
const map = src => {
	// The result's container.
	let l = [];
	// Split by return carriage. Excel splits by newline.
	src = src.split(/\r\n|\n/);

	// Loop through each line, excluding empty ones (Don't need those).
	for (let x in src) if (src[x].length) {
		// Quotation mark counter.
		let n = -1; // -1 = No " found; 0 = " Found; 1 = Last " Found
		// Row elements.
		let v = [];
		// Create empty string for first entry.
		let i = v.push("") - 1;

		// Loop through each character.
		for (let y in src[x]) {
			// New entry if 'comma' and n is not 0.
			if (src[x][y] == "," && n) {
				// Create empty string for next entry.
				i = v.push("") - 1;
				// Set quotation mark counter to -1 again.
				n = -1;
			// See if is a double quotation mark.
			} else if (src[x][y] == '"') {
				/* If counter is 1 and there's still a quotation mark.
				   This means that the user deliberately put it there.
				*/
				if (n == 1)
					v[i] += '"';

				// Increment counter up until 1 then go back to 0.
				n = (n + 1)%2;
			} else
				// Append character to entry.
				v[i] += src[x][y];
		}

		// Append the entire to array.
		l.push(v);
	}

	// This will contain the finalized infrastructure.
	let data = {};

	// Locations that we know exactly where it is.
	let known = {};

	// Go for a first run through to see the gist of the map.
	for (let i = 1; i < l.length; i++) if (l[i].toString().length) {
		// l[i][1] = Location; l[i][2] = Destination; l[i][3] = Distance

		// Make an entry for 'location' in the 'known' table.
		if (!known[l[i][2]])
			known[l[i][2]] = [];

		// Turn 'distance' into a number (It's stored as a string).
		l[i][3] = Number(l[i][3]);

		/* Add data that we know that 'destination' is found
		   X 'distance' away from 'location'.
		*/
		known[l[i][2]].push([l[i][1], l[i][3]]);
	}

	// Plot down the 'known' locations.
	for (let x in known) for (let y in known[x]) {
		// 'A' = Most likely post offices; 'B' = Destination.
		/* If 'A' has yet to be plotted, make a random point on the
		   map. These are most likely post offices, since we only
		   base the locations X 'distance' from the post offices.
		*/
		if (!data[known[x][y][0]])
			/* It's a table since we'll be adding more entries in it,
			   not just the position.
			*/
			data[known[x][y][0]] = {
				position: new lemon.Vector([
					(Math.random() - 0.5)*10,
					(Math.random() - 0.5)*10
				])
			};

		// Grab 'A's position (2D Vector).
		let a = data[known[x][y][0]].position;

		/* Make sure 'B' wasn't added before. It would be weird if
		   'B' can be found from 2 post offices at different
		   distances (Maybe worm holes?).
		*/
		if (!data[x]) {
			/* Generate a random angle then set 'B's position
			   X distance away from 'A'.
			*/
			let i = Math.random()*Math.PI*2;
			data[x] = {
				position: new lemon.Vector([
					a[0] + Math.cos(i)*known[x][y][1],
					a[1] + Math.sin(i)*known[x][y][1]
				]),
				// See, we added more entries!
				// 'A'. Most likely post office.
				from: known[x][y][0],
				// Much more serious word for 'distance'.
				magnitude: known[x][y][1]
			};
		}
	}

	/* Send that beautiful data into the world, eventually realizing
	   that it has regretted being born in a wasteland full of hate
	   and suffering, inevitably questioning its reason for existence.
	   Why are we here? What is my reason for being? What is my
	   purpose?
	*/
	return data;
};