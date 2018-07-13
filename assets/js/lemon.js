const lemon = {
	abs: i => (i < 0 ? -i : i),
	floor: i => (i - i%1) - (i%1 < 0 ? 1 : 0),
	ceil: i => (i - i%1) + (i%1 > 0 ? 1 : 0),
	sqrt: i => {
		if (i <= 1) return i; else if (i < 0) return NaN; // Imaginary.

		let a = i/2;
		let b = a + (i/a)/2;

		while (lemon.abs(a - b) >= 0.0000001) { // Precision.
			a = b;
			b = (a + (i/a))/2;
		}

		return b;
	},
	root: (i, e) => {
		let v = i;

		if (!e)
			v = 1;

		for (e; e > 1; e--)
			v *= i;

		return v;
	}
};

// Objects
lemon.Vector = function(l) {
	let magnitude, unit;

	for (let i = 0; i < l.length; i++)
		this[i] = l[i];

	this.length = l.length;

	this.magnitude = _ => {
		let d;

		if (!magnitude)
			d = 1;
		else for (let i in l) if (l[i] != this[i]) {
			unit = null;
			d = 1;
			break;
		}

		if (d) {
			magnitude = 0;

			for (let i in l) {
				l[i] = this[i];
				magnitude += l[i]*l[i];
			}

			magnitude = lemon.sqrt(magnitude);
		}

		return magnitude;
	};

	this.unit = _ => {
		let d;

		if (!unit)
			d = 1;
		else for (let i in l) if (l[i] != this[i]) {
			magnitude = null;
			d = 1;
			break;
		}

		if (d) {
			if (!magnitude) this.magnitude();

			let n = [];

			for (let i in l) {
				l[i] = this[i];

				n.push(l[i]/magnitude);
			}

			unit = new lemon.Vector(n);
		}

		return unit;
	};
};