import { describe, it, expect, /* vi */ } from 'vitest';
import { getHighResImage, export_format, /* print, download_file, */ validate_markdown } from './utils';
import { createMockCard, create_mock_deck } from './test-helpers';
import type { FileFormat } from './types';
// import { format } from './paraglide/messages';
import { NRDB_IMAGE_URL, /* NRDB_API_URL */ } from '$lib/constants';

describe('getHighResImage', () => {
    it('should return NSG image URL for elevation cycle cards', () => {
        const card = createMockCard('1', 'Test Card', ['elevation', 'other'], {
            latest_printing_id: 'print123'
        });

        const result = getHighResImage(card);
        expect(result).toBe(`${NRDB_IMAGE_URL}/xlarge/print123.webp`);
    });

    it('should return NSG image URL for liberation cycle cards', () => {
        const card = createMockCard('1', 'Test Card', ['liberation'], {
            latest_printing_id: 'print123'
        });

        const result = getHighResImage(card);
        expect(result).toBe(`${NRDB_IMAGE_URL}/xlarge/print123.webp`);
    });

    it('should return NSG image URL for borealis cycle cards', () => {
        const card = createMockCard('1', 'Test Card', ['borealis'], {
            latest_printing_id: 'print123'
        });

        const result = getHighResImage(card);
        expect(result).toBe(`${NRDB_IMAGE_URL}/xlarge/print123.webp`);
    });

    it('should return NSG image URL for ashes cycle cards', () => {
        const card = createMockCard('1', 'Test Card', ['ashes'], {
            latest_printing_id: 'print123'
        });

        const result = getHighResImage(card);
        expect(result).toBe(`${NRDB_IMAGE_URL}/xlarge/print123.webp`);
    });

    it('should return NSG image URL for system_gateway cycle cards', () => {
        const card = createMockCard('1', 'Test Card', ['system_gateway'], {
            latest_printing_id: 'print123'
        });

        const result = getHighResImage(card);
        expect(result).toBe(`${NRDB_IMAGE_URL}/xlarge/print123.webp`);
    });

    it('should return NSG image URL when card has multiple cycles including NSG cycle', () => {
        const card = createMockCard('1', 'Test Card', ['core', 'elevation', 'other'], {
            latest_printing_id: 'print123'
        });

        const result = getHighResImage(card);
        expect(result).toBe(`${NRDB_IMAGE_URL}/xlarge/print123.webp`);
    });

    it('should return classic NRDB image URL for non-NSG cycle cards', () => {
        const card = createMockCard('1', 'Test Card', ['core'], {
            latest_printing_images: {
                nrdb_classic: {
                    tiny: 'tiny-url',
                    small: 'small-url',
                    medium: 'medium-url',
                    large: 'large-url'
                }
            }
        });

        const result = getHighResImage(card);
        expect(result).toBe('large-url');
    });

    it('should return classic NRDB image URL for empty card_cycle_ids', () => {
        const card = createMockCard('1', 'Test Card', [], {
            latest_printing_images: {
                nrdb_classic: {
                    tiny: 'tiny-url',
                    small: 'small-url',
                    medium: 'medium-url',
                    large: 'large-url'
                }
            }
        });

        const result = getHighResImage(card);
        expect(result).toBe('large-url');
    });
});

describe('export_format', async () => {
    const decklist = await create_mock_deck();
    const data_formatted = (format: FileFormat) => export_format(decklist, format);

    it('should export decklist in JSON format', () => {
        const result = JSON.stringify(data_formatted('json'), null, 2);
        expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should export decklist in Markdown format', () => {
        const result = data_formatted('md');
        expect(validate_markdown(result as string)).toBe(true);
    });
})

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