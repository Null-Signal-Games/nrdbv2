import { describe, it, expect /* vi */ } from 'vitest';
import {
	getHighResImage,
	export_format,
	group_cards_by_type,
	/* print, download_file, */ validate_markdown
} from './utils';
import { CARNIVORE, CONDUIT, COOKBOOK, SURE_GAMBLE } from './cards.fixture';
import { createMockCard, createMockPrinting, create_mock_deck } from './test-helpers';
import type { FileFormat } from './types';
// import { format } from './paraglide/messages';

describe('getHighResImage', () => {
	it('returns a card xlarge image by default when available', () => {
		const card = createMockCard('1', 'Test Card', ['core'], {
			latest_printing_images: {
				nrdb_classic: {
					tiny: 'card-tiny',
					small: 'card-small',
					medium: 'card-medium',
					large: 'card-large',
					xlarge: 'card-xlarge'
				}
			}
		});

		expect(getHighResImage(card)).toBe('card-xlarge');
	});

	it('returns the requested card image size', () => {
		const card = createMockCard('1', 'Test Card', ['core'], {
			latest_printing_images: {
				nrdb_classic: {
					tiny: 'card-tiny',
					small: 'card-small',
					medium: 'card-medium',
					large: 'card-large',
					xlarge: 'card-xlarge'
				}
			}
		});

		expect(getHighResImage(card, 'small')).toBe('card-small');
	});

	it('returns a printing xlarge image by default when available', () => {
		const card = createMockCard('1', 'Test Card', ['core']);
		const printing = createMockPrinting(card, 'print123', {
			images: {
				nrdb_classic: {
					tiny: 'printing-tiny',
					small: 'printing-small',
					medium: 'printing-medium',
					large: 'printing-large',
					xlarge: 'printing-xlarge'
				}
			}
		});

		expect(getHighResImage(printing)).toBe('printing-xlarge');
	});

	it('returns the requested printing image size', () => {
		const card = createMockCard('1', 'Test Card', ['core']);
		const printing = createMockPrinting(card, 'print123', {
			images: {
				nrdb_classic: {
					tiny: 'printing-tiny',
					small: 'printing-small',
					medium: 'printing-medium',
					large: 'printing-large',
					xlarge: 'printing-xlarge'
				}
			}
		});

		expect(getHighResImage(printing, 'medium')).toBe('printing-medium');
	});

	it('falls back to large by default when xlarge metadata is absent', () => {
		const card = createMockCard('1', 'Test Card', ['core']);
		const printing = createMockPrinting(card, 'print123', {
			images: {
				nrdb_classic: {
					tiny: 'printing-tiny',
					small: 'printing-small',
					medium: 'printing-medium',
					large: 'printing-large'
				}
			}
		});

		expect(getHighResImage(printing)).toBe('printing-large');
	});
});

describe('group_cards_by_type', () => {
	it('orders groups by the canonical card type order, not input order', () => {
		const groups = group_cards_by_type([COOKBOOK, CONDUIT, CARNIVORE, SURE_GAMBLE]);

		expect(groups.map((group) => group.type)).toEqual([
			'event',
			'hardware',
			'program',
			'resource'
		]);
	});
});

describe('export_format', async () => {
	const decklist = await create_mock_deck();
	const data_formatted = (format: FileFormat) => export_format(decklist, format, []);

	it('should export decklist in JSON format', () => {
		const result = JSON.stringify(data_formatted('json'), null, 2);
		expect(() => JSON.parse(result)).not.toThrow();
	});

	it('should export decklist in Markdown format', () => {
		const result = data_formatted('md');
		expect(validate_markdown(result as string)).toBe(true);
	});
});

/*
describe('download_file', () => {
    it('downloads a file with .json extension', () => {
        // Mock anchor element
        const mockClick = vi.fn();
        const mockAnchor = {
            set href(val) { this._href = val; },
            get href() { return this._href; },
            set download(val) { this._download = val; },
            get download() { return this._download; },
            click: mockClick,
            style: {},
        };
        const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            if (tag === 'a') return mockAnchor;
            // @ts-ignore
            return document.createElement.original ? document.createElement.original(tag) : document.createElement(tag);
        });
        // Mock appendChild and removeChild
        const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
        // Mock URL.createObjectURL
        const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:url');

        download_file('data', 'filename', 'json');

        expect(mockAnchor.download).toBe('filename.json');
        expect(mockClick).toHaveBeenCalled();

        // Restore mocks
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
        createObjectURLSpy.mockRestore();
    });
});
*/
