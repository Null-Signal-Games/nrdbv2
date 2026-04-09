import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            expect: { requireAssertions: true },
            projects: [
                {
                    extends: './vite.config.ts',
                    test: {
                        name: 'client',
                        environment: 'browser',
                        browser: {
                            enabled: true,
                            provider: 'playwright',
                            instances: [
                                {
                                    browser: 'chromium'
                                }
                            ]
                        },
                        include: [
                            'src/**/*.svelte.{test,spec}.{js,ts}',
                            'src/**/*.browser.{test,spec}.{js,ts}'
                        ],
                        exclude: ['src/lib/server/**'],
                        setupFiles: ['./vitest-setup-client.ts']
                    }
                },
                {
                    extends: './vite.config.ts',
                    test: {
                        name: 'server',
                        environment: 'node',
                        include: ['src/**/*.{test,spec}.{js,ts}'],
                        exclude: [
                            'src/**/*.svelte.{test,spec}.{js,ts}',
                            'src/**/*.browser.{test,spec}.{js,ts}'
                        ]
                    }
                }
            ]
        }
    })
);