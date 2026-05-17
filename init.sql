CREATE TABLE IF NOT EXISTS crawl_sessions (

    id SERIAL PRIMARY KEY,

    site_url TEXT,

    started_at TIMESTAMP DEFAULT NOW(),

    total_urls INTEGER DEFAULT 0,

    hard404_count INTEGER DEFAULT 0,

    soft404_count INTEGER DEFAULT 0

);

CREATE TABLE IF NOT EXISTS crawl_results (

    id SERIAL PRIMARY KEY,

    session_id INTEGER,

    url TEXT,

    status INTEGER,

    title TEXT,

    hard404 BOOLEAN,

    soft404 BOOLEAN,

    scanned_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_session_url
    UNIQUE (session_id, url)

);

CREATE TABLE IF NOT EXISTS crawl_links (

    id SERIAL PRIMARY KEY,

    session_id INTEGER,

    source_url TEXT,

    target_url TEXT,

    anchor_text TEXT,

    target_status INTEGER,

    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_link_per_session

    UNIQUE (
        session_id,
        source_url,
        target_url
    )

);