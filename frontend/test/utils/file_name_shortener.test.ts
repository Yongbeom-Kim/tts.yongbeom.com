import { describe, test, expect } from 'vitest';
import { shorten_file_name } from '../../src/utils/file_name_shortener';

describe('test_file_name_shortener', () => {
    test('file_name_too_short', () => {
        expect(shorten_file_name('a.txt', 10)).toBe('a.txt');
    })
    test('result_length_too_short', () => {
        expect(() => shorten_file_name('a.txt', 1)).toThrow();
    })
    test('no extension', () => {
        expect(() => shorten_file_name('a', 10)).toThrow();
    })
    test('file name just right', () => {
        expect(shorten_file_name('a.txt', 5)).toBe('a.txt');
    })
    test('file name too long', () => {
        expect(shorten_file_name('abcdefgh.txt', 7)).toBe('a...txt');
    })
})