function List() {
	let length = 0;
	let head = null;
	let tail = null;

	function Node(value, parent) {
		this.value = value
		this.parent = parent
		this.child = null
	}

	this.push = v => {
		if (!tail)
			head = tail = new Node(v, null);
		else {
			let p = tail;
			tail = new Node(v, tail);
			p.child = tail;
		}

		length++;
	};

	this.pop = _ => {
		if (tail) {
			let v = tail;
			tail = v.parent;

			if (tail)
				tail.child = null;

			length--;

			return v.value;
		}
	};

	this.shift = _ => {
		if (head) {
			let v = head;
			head = head.child;

			if (head)
				head.parent = null;

			length--;

			return v.value;
		}
	};

	this.head = _ => head && head.value;
	this.tail = _ => tail && tail.value;
	this.length = _ => length;
}