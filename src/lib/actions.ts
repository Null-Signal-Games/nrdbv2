import type { Card } from './types';
import { tooltip as _tooltip } from './store';

export const tooltip = (node: HTMLElement, card: Card) => {
	// event: MouseEvent
	const enter = () => {
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

	node.addEventListener('mouseenter', enter);
	node.addEventListener('focus', enter);

	const leave = () => {
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

	node.addEventListener('mouseleave', leave);
	node.addEventListener('blur', leave);

	return {
		destroy() {
			node.removeEventListener('mouseenter', enter);
		}
	};
};
