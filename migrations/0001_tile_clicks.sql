-- ABOUTME: Schema for anonymous tile clicks: which budget tiles visitors open, cut or add to, per page visit.
-- ABOUTME: Holds no IP address, user agent or device id; a session is a random id that lives only in one page visit.
CREATE TABLE IF NOT EXISTS tile_clicks (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	session TEXT NOT NULL,
	seq INTEGER NOT NULL,
	locale TEXT NOT NULL,
	line TEXT NOT NULL,
	action TEXT NOT NULL CHECK (action IN ('open', 'cut', 'add')),
	percent INTEGER NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS tile_clicks_line ON tile_clicks (line, action);
