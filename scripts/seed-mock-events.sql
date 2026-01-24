-- Seed mock AI traffic events (last 48h) so the dashboard shows data.
-- Run: docker exec -i lumen-clickhouse clickhouse-client --multiquery < scripts/seed-mock-events.sql

INSERT INTO default.ai_traffic_events (
  ts, received_at, version, event_type,
  request_id, nonce, key_id, project_id,
  method, pathname, route, ip, user_agent, referer,
  is_ai, ai_vendor, bot_name, intent, confidence
)
SELECT
  now64(3) - toIntervalHour(number % 48) - toIntervalMinute(number * 7 % 60) AS ts,
  now64(3) AS received_at,
  1 AS version,
  'request' AS event_type,
  generateUUIDv4() AS request_id,
  concat('n', toString(number)) AS nonce,
  'key-demo' AS key_id,
  'default' AS project_id,
  'GET' AS method,
  pathnames[(number % length(pathnames)) + 1] AS pathname,
  routes[(number % length(routes)) + 1] AS route,
  '127.0.0.1' AS ip,
  if(is_ais[(number % length(is_ais)) + 1] = 1, concat('Mozilla/5.0 (compatible; ', bot_names[(number % length(bot_names)) + 1], '/1.0)'), 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0') AS user_agent,
  '' AS referer,
  is_ais[(number % length(is_ais)) + 1] AS is_ai,
  if(is_ais[(number % length(is_ais)) + 1] = 1, vendors[(number % length(vendors)) + 1], '') AS ai_vendor,
  if(is_ais[(number % length(is_ais)) + 1] = 1, bot_names[(number % length(bot_names)) + 1], '') AS bot_name,
  'page_view' AS intent,
  '0.95' AS confidence
FROM numbers(500) AS n
CROSS JOIN (
  SELECT
    ['/', '/api/docs', '/blog', '/pricing', '/docs', '/api/v1/users', '/products'] AS pathnames,
    ['/', '/api/docs', '/blog', '/pricing', '/docs', '/api/v1/users', '/products'] AS routes,
    [0, 0, 0, 1, 1, 1, 1] AS is_ais,
    ['OpenAI', 'Anthropic', 'Perplexity', 'Google', 'Meta', 'Common Crawl'] AS vendors,
    ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Meta-ExternalAgent', 'CCBot'] AS bot_names
) AS params;
