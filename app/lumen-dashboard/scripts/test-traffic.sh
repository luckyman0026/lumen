#!/usr/bin/env bash
#
# AI Traffic Analyzer - Test Traffic Generator
# Generates realistic AI bot traffic for testing the collector service
#
# Usage: ./scripts/test-traffic.sh [OPTIONS]
#   -n, --count       Number of events to generate (default: 100)
#   -b, --batch-size  Events per batch (default: 10)
#   -d, --delay       Delay between batches in seconds (default: 0.5)
#   -u, --url         Collector URL (default: http://localhost:8080)
#   -k, --api-key     API key (default: your-secret-token-here)
#   -h, --help        Show this help message

set -euo pipefail

# Default configuration
COLLECTOR_URL="${COLLECTOR_URL:-http://localhost:8080}"
API_KEY="${INGEST_TOKEN:-your-secret-token-here}"
EVENT_COUNT=100
BATCH_SIZE=10
DELAY=0.5

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Real AI bot user agents (from ai-robots-txt/ai.robots.txt)
AI_USER_AGENTS=(
    # OpenAI
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot"
    # Anthropic
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0; +https://anthropic.com/claudebot"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Claude-User/1.0; +https://anthropic.com"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; anthropic-ai/1.0"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Claude-SearchBot/1.0; +https://anthropic.com"
    # Google
    "Mozilla/5.0 (compatible; Google-Extended/1.0; +http://www.google.com/bot.html)"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GoogleOther/1.0"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Google-CloudVertexBot/1.0"
    # Perplexity
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/bot"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Perplexity-User/1.0"
    # Meta
    "Mozilla/5.0 (compatible; FacebookBot/1.0; +https://developers.facebook.com/docs/sharing/bot)"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Meta-ExternalAgent/1.0"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; meta-externalfetcher/1.0"
    # ByteDance
    "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; TikTokSpider/1.0"
    # Common Crawl
    "CCBot/2.0 (https://commoncrawl.org/faq/)"
    # Amazon
    "Mozilla/5.0 (compatible; Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; bedrockbot/1.0"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; amazon-kendra/1.0"
    # Apple
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 Applebot/0.1"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Applebot-Extended/1.0"
    # Cohere
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; cohere-ai/1.0; +https://cohere.com"
    # DeepSeek
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; DeepSeekBot/1.0"
    # Mistral
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; MistralAI-User/1.0"
    # Other AI bots
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; YouBot/1.0; +https://about.you.com/youbot"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; DuckAssistBot/1.0"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PhindBot/1.0"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; AI2Bot/1.0"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Diffbot/1.0"
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PetalBot/1.0"
)

# Regular browser user agents (non-AI traffic)
BROWSER_USER_AGENTS=(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36"
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.2210.91"
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"
)

# Sample routes
ROUTES=(
    "/api/products" "/api/products/123" "/api/catalog" "/api/catalog/electronics"
    "/api/search" "/api/search?q=laptop" "/api/users/profile" "/api/orders"
    "/blog/post-1" "/blog/post-2" "/blog/post-3" "/docs/api" "/docs/getting-started"
    "/about" "/contact" "/pricing" "/features" "/" "/sitemap.xml" "/robots.txt"
)

# HTTP methods
HTTP_METHODS=("GET" "GET" "GET" "GET" "GET" "GET" "GET" "POST" "PUT" "DELETE")

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--count) EVENT_COUNT="$2"; shift 2 ;;
        -b|--batch-size) BATCH_SIZE="$2"; shift 2 ;;
        -d|--delay) DELAY="$2"; shift 2 ;;
        -u|--url) COLLECTOR_URL="$2"; shift 2 ;;
        -k|--api-key) API_KEY="$2"; shift 2 ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "  -n, --count       Number of events (default: 100)"
            echo "  -b, --batch-size  Events per batch (default: 10)"
            echo "  -d, --delay       Delay between batches in seconds (default: 0.5)"
            echo "  -u, --url         Collector URL (default: http://localhost:8080)"
            echo "  -k, --api-key     API key (default: your-secret-token-here)"
            exit 0 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Helper functions
random_element() { local arr=("$@"); echo "${arr[$RANDOM % ${#arr[@]}]}"; }
random_int() { echo $(( RANDOM % ($2 - $1 + 1) + $1 )); }

generate_uuid() {
    uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || \
    cat /proc/sys/kernel/random/uuid 2>/dev/null || \
    python3 -c "import uuid; print(uuid.uuid4())"
}

generate_timestamp() {
    local offset=$(random_int 0 3600)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        date -u -v-${offset}S +"%Y-%m-%dT%H:%M:%SZ"
    else
        date -u -d "-${offset} seconds" +"%Y-%m-%dT%H:%M:%SZ"
    fi
}

generate_ip() { echo "$(random_int 1 254).$(random_int 0 255).$(random_int 0 255).$(random_int 1 254)"; }

# Generate a single event
generate_event() {
    local is_ai=$1
    local user_agent
    
    if [[ "$is_ai" == "true" ]]; then
        user_agent=$(random_element "${AI_USER_AGENTS[@]}")
    else
        user_agent=$(random_element "${BROWSER_USER_AGENTS[@]}")
    fi
    user_agent=$(echo "$user_agent" | sed 's/"/\\"/g')
    
    cat <<EOF
{"version":"1","eventType":"request","requestId":"$(generate_uuid)","timestamp":"$(generate_timestamp)","nonce":"$(generate_uuid | cut -d'-' -f1)","keyId":"test-key-001","method":"$(random_element "${HTTP_METHODS[@]}")","pathname":"$(random_element "${ROUTES[@]}")","ip":"$(generate_ip)","userAgent":"$user_agent","referer":""}
EOF
}

# Generate a batch
generate_batch() {
    local count=$1
    local events=""
    for ((i=0; i<count; i++)); do
        local is_ai="false"
        [[ $(random_int 1 100) -le 40 ]] && is_ai="true"
        [[ -n "$events" ]] && events+=","
        events+=$(generate_event "$is_ai")
    done
    echo "{\"events\":[$events]}"
}

# Send batch
send_batch() {
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "$COLLECTOR_URL/v1/events" \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $API_KEY" \
        -d "$1")
    
    if [[ "$http_code" == "202" || "$http_code" == "200" ]]; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗ ($http_code)${NC}"
        return 1
    fi
}

# Main
echo "Sending $EVENT_COUNT events to $COLLECTOR_URL..."

num_batches=$(( (EVENT_COUNT + BATCH_SIZE - 1) / BATCH_SIZE ))
events_sent=0
successful=0

for ((batch=1; batch<=num_batches; batch++)); do
    remaining=$((EVENT_COUNT - events_sent))
    current_size=$((remaining < BATCH_SIZE ? remaining : BATCH_SIZE))
    
    printf "Batch %d/%d (%d events): " "$batch" "$num_batches" "$current_size"
    send_batch "$(generate_batch "$current_size")" && ((successful++))
    
    events_sent=$((events_sent + current_size))
    [[ $batch -lt $num_batches ]] && sleep "$DELAY"
done

echo "Done! $successful/$num_batches batches successful."
