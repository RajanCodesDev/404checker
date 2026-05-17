import { PlaywrightCrawler } from 'crawlee';

import { currentSessionId }
    from '../storage/runtime.js';

import { isHard404 }
    from '../classifiers/hard404.js';

import { isSoft404 }
    from '../classifiers/soft404.js';

import { pool }
    from '../storage/postgres.js';

export const crawler =
    new PlaywrightCrawler({

        maxRequestsPerCrawl: 500,

        maxConcurrency: 1,

        minConcurrency: 1,

        navigationTimeoutSecs: 45,

        preNavigationHooks: [

            async ({ page }) => {

                await page.route(
                    '**/*',
                    (route) => {

                        const type =
                            route.request()
                                .resourceType();

                        if (
                            [
                                'image',
                                'font',
                                'media'
                            ].includes(type)
                        ) {
                            return route.abort();
                        }

                        return route.continue();

                    }
                );

            }
        ],

        launchContext: {

            launchOptions: {

                headless: true,

                args: [

                    '--no-sandbox',

                    '--disable-setuid-sandbox',

                    '--disable-dev-shm-usage'

                ]
            }
        },

        async requestHandler({

            request,

            page,

            response,

            enqueueLinks,

            log

        }) {

            await page.waitForTimeout(2000);

            const status =
                response?.status() || 0;

            const title =
                await page.title();

            const bodyText =
                await page
                    .locator('body')
                    .innerText();

            const hard404 =
                isHard404(status);

            const soft404 =
                isSoft404(
                    status,
                    title,
                    bodyText
                );

            const links =
                await page.$$eval(

                    'a',

                    els => els.map(el => ({

                        href: el.href,

                        text:
                            el.innerText.trim()

                    }))

                );

            console.log(
                'LINK COUNT:',
                links.length
            );

            log.info(
                `Crawled: ${request.url}`
            );

            console.log({

                url: request.url,

                status,

                title,

                textLength:
                    bodyText.length,

                hard404,

                soft404

            });

            /*
            -------------------------
            STORE PAGE RESULT
            -------------------------
            */

            await pool.query(

                `
            INSERT INTO crawl_results (

                session_id,

                url,

                status,

                title,

                hard404,

                soft404

            )

            VALUES (

                $1,
                $2,
                $3,
                $4,
                $5,
                $6

            )

            ON CONFLICT (
                session_id,
                url
            )

            DO NOTHING
            `,
                [

                    currentSessionId,

                    request.url,

                    status,

                    title,

                    hard404,

                    soft404

                ]

            );

            /*
            -------------------------
            STORE LINK GRAPH
            -------------------------
            */
            let insertedLinks = 0;
            for (const link of links) {

                try {

                    if (
                        !link.href ||
                        !link.href.startsWith('http')
                    ) {
                        continue;
                    }

                    await pool.query(

                        `
                        INSERT INTO crawl_links (

                            session_id,

                            source_url,

                            target_url,

                            anchor_text

                        )

                        VALUES (

                            $1,
                            $2,
                            $3,
                            $4

                        )

                        ON CONFLICT (

                            session_id,

                            source_url,

                            target_url

                        )

                        DO NOTHING
                        `,
                        [

                            currentSessionId,

                            request.url,

                            link.href,

                            link.text || ''

                        ]

                    );

                    insertedLinks++;


                } catch (error) {

                    console.log({

                        linkInsertError:
                            error.message,

                        source:
                            request.url,

                        target:
                            link.href

                    });

                }



            }

            console.log({
                insertedLinks
            });

            /*
            -------------------------
            ENQUEUE NEW URLS
            -------------------------
            */

            const enqueueResult =
                await enqueueLinks({

                    strategy:
                        'same-domain',

                    exclude: [

                        '**/wp-admin/**',

                        '**/feed/**',

                        '**?*',

                        '**#*',

                        '**/*.jpg',

                        '**/*.png',

                        '**/*.pdf',

                        '**/*.webp',

                        '**/cdn-cgi/**'

                    ]
                });

            console.log({

                processed:
                    enqueueResult
                        .processedRequests
                        .length,

                unprocessed:
                    enqueueResult
                        .unprocessedRequests
                        .length

            });

        },

        async failedRequestHandler({

            request,

            error

        }) {

            console.log({

                failedUrl:
                    request.url,

                error:
                    error.message

            });

            try {

                await pool.query(

                    `
            INSERT INTO crawl_results (

                session_id,

                url,

                status,

                title,

                hard404,

                soft404

            )

            VALUES (

                $1,
                $2,
                $3,
                $4,
                $5,
                $6

            )

            ON CONFLICT (
                session_id,
                url
            )

            DO NOTHING
            `,
                    [

                        currentSessionId,

                        request.url,

                        0,

                        'CRAWL FAILED',

                        false,

                        false

                    ]

                );

            } catch (dbError) {

                console.log({

                    failedInsert:
                        dbError.message

                });

            }

        }

    });