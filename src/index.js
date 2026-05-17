import { crawler } from './crawler/crawler.js';
import { Configuration } from 'crawlee';
import { createSession } from './storage/session.js';
import { setSessionId } from './storage/runtime.js';
import { finalizeSession } from './storage/sessionStats.js';

Configuration.getGlobalConfig().set(
    'storageDir',
    './runtime_storage'
);

Configuration.getGlobalConfig().set(
    'memoryMbytes',
    2048
);

const siteUrl =
    'https://www.hptourtravel.com/';

const sessionId =
    await createSession(siteUrl);

setSessionId(sessionId);

await crawler.run([
    siteUrl
]);

await finalizeSession(sessionId);