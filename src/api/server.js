import Fastify from 'fastify';
import cors from '@fastify/cors';

import { pool } from '../storage/postgres.js';

const fastify = Fastify({
    logger: true
});

await fastify.register(cors, {
    origin: true
});

fastify.get('/health', async () => {

    return {
        status: 'ok'
    };

});

fastify.get('/latest-session', async () => {

    const result = await pool.query(

        `
        SELECT *

        FROM crawl_sessions

        ORDER BY started_at DESC

        LIMIT 1
        `
    );

    return result.rows[0];

});


fastify.get('/broken-links', async () => {

    const result = await pool.query(`

        SELECT

            cl.target_url,

            COUNT(
                DISTINCT cl.source_url
            ) AS affected_pages,

            MAX(cr.status) AS status

        FROM crawl_links cl

        JOIN crawl_results cr

        ON TRIM(TRAILING '/' FROM cl.target_url)

        =

        TRIM(TRAILING '/' FROM cr.url)

        WHERE

            cl.session_id = (

                SELECT id

                FROM crawl_sessions

                ORDER BY started_at DESC

                LIMIT 1

            )

        AND (

            cr.hard404 = true

            OR

            cr.soft404 = true

        )

        GROUP BY
            cl.target_url

        ORDER BY
            affected_pages DESC

    `);

    return result.rows;

});


fastify.get('/results', async () => {

    const result = await pool.query(`

        SELECT

            cr.id,

            cs.site_url,

            cr.url,

            cr.status,

            cr.title,

            cr.hard404,

            cr.soft404,

            cr.scanned_at

        FROM crawl_results cr

        JOIN crawl_sessions cs
        ON cr.session_id = cs.id

        WHERE cr.session_id = (

            SELECT id

            FROM crawl_sessions

            ORDER BY started_at DESC

            LIMIT 1

        )

        ORDER BY cr.scanned_at DESC

        LIMIT 500

    `);

    return result.rows;

});



const start = async () => {

    try {

        await fastify.listen({
            port: 3000,
            host: '0.0.0.0'
        });

        console.log(
            'API running on http://localhost:3000'
        );

    } catch (err) {

        fastify.log.error(err);

        process.exit(1);

    }

};

start();
