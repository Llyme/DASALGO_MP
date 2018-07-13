let tooltip;
let div_tooltip = q("!div");
div_tooltip.id = "tooltip";

div_tooltip.setAttribute("hidden", 1);
document.body.appendChild(div_tooltip);

/**
 * Move the tooltip container.
 * @param Object event - The event.
**/
function tooltip_move(event) {
	if (!div_tooltip.getAttribute("hidden")) {
		let x = div_tooltip.clientWidth,
			y = div_tooltip.clientHeight;

		div_tooltip.style.left = Math.min(
			event.x + 2,
			innerWidth - div_tooltip.clientWidth
		) + "px";
		div_tooltip.style.top = Math.max(
			event.y - div_tooltip.clientHeight - 2,
			0
		) + "px";
	}
}

document.addEventListener("mousemove", tooltip_move);

/**
 * Make it so that the element sets the tooltip's message when it's
 * hovered, and clear after unhovering.
 * @param Object elm - The element that owns the message.
 * @param String value - The message.
 * @param Function cond - The condition fired when hovering.
		The function must return a value that doesn't equate
		to 'false' (zero, empty string, etc). 'elm' is passed
		as the argument.
 * @param Integer flag - 0 = None; 1 = Hide on focus or mouse down.
 * @return Object elm.
**/
function tooltip_new(elm, value, cond, flag) {
	elm.addEventListener("mouseenter", event => {
		if (!cond || cond(elm)) {
			tooltip = elm;
			div_tooltip.innerHTML = value;

			div_tooltip.removeAttribute("hidden");
			tooltip_move(event);
		}
	});

	elm.addEventListener("mouseleave", event => {
		// Make sure that the current focus is this element.
		if (tooltip === elm) {
			tooltip = null;

			div_tooltip.setAttribute("hidden", 1);
		}
	});

	function hide(event) {
		if (flag && tooltip === elm) {
			tooltip = null;

			div_tooltip.setAttribute("hidden", 1);
		}
	}

	elm.addEventListener("mousedown", hide);
	elm.addEventListener("focus", hide);

	return elm;
}