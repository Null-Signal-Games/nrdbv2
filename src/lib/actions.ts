import type { Card, Printing } from './types';
import { tooltip as _tooltip, tooltip_hover } from './store';
import { get } from 'svelte/store';

export const tooltip = (node: HTMLElement, card: Card | Printing) => {
	let leave_timeout: ReturnType<typeof setTimeout> | null = null;

	const enter = () => {
		// Clear any pending hide
		if (leave_timeout) {
			clearTimeout(leave_timeout);
			leave_timeout = null;
		}

		const rect = node.getBoundingClientRect();

		_tooltip.set({
			element: node,
			visible: true,
			card: card,
			position: {
				x: rect.left + rect.width / 2,
				y: rect.top
			}
		});
	};

	const hide = () => {
		_tooltip.set({
			element: null,
			visible: false,
			card: null,
			position: {
				x: 0,
				y: 0
			}
		});
	};

	const leave = () => {
		// Delay hiding to allow cursor to move to bridge/tooltip
		leave_timeout = setTimeout(() => {
			const hover = get(tooltip_hover);
			if (!hover.is_over_tooltip && !hover.is_over_bridge) {
				hide();
			}
		}, 50);
	};

	node.addEventListener('mouseenter', enter);
	node.addEventListener('focus', enter);
	node.addEventListener('mouseleave', leave);
	node.addEventListener('blur', hide);

	return {
		destroy() {
			if (leave_timeout) clearTimeout(leave_timeout);
			node.removeEventListener('mouseenter', enter);
			node.removeEventListener('focus', enter);
			node.removeEventListener('mouseleave', leave);
			node.removeEventListener('blur', hide);
		}
	};
};
