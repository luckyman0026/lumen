// Package classifier provides AI traffic classification based on User-Agent strings.
package classifier

import (
	"strings"
)

// Classification holds the AI classification result for a request.
type Classification struct {
	IsAI       bool
	AIVendor   string
	BotName    string
	Intent     string
	Confidence string
}

// botSignature defines a bot's detection pattern and metadata.
type botSignature struct {
	patterns []string // Substrings to match in User-Agent (lowercase)
	vendor   string
	botName  string
	intent   string
}

// knownBots contains signatures for known AI bots and crawlers.
var knownBots = []botSignature{
	// OpenAI
	{
		patterns: []string{"gptbot", "chatgpt-user", "oai-searchbot", "chatgpt agent", "openai"},
		vendor:   "openai",
		botName:  "GPTBot",
		intent:   "training",
	},
	// Anthropic
	{
		patterns: []string{"claudebot", "claude-web", "anthropic-ai", "claude-user", "claude-searchbot"},
		vendor:   "anthropic",
		botName:  "ClaudeBot",
		intent:   "training",
	},
	// Perplexity
	{
		patterns: []string{"perplexitybot", "perplexity-user"},
		vendor:   "perplexity",
		botName:  "PerplexityBot",
		intent:   "search",
	},
	// Google AI
	{
		patterns: []string{"google-extended", "googleother", "google-cloudvertexbot", "google-notebooklm", "gemini"},
		vendor:   "google",
		botName:  "Google-Extended",
		intent:   "training",
	},
	// Common Crawl
	{
		patterns: []string{"ccbot", "commoncrawl"},
		vendor:   "commoncrawl",
		botName:  "CCBot",
		intent:   "training",
	},
	// Cohere
	{
		patterns: []string{"cohere-ai", "cohere-training-data-crawler"},
		vendor:   "cohere",
		botName:  "CohereBot",
		intent:   "training",
	},
	// Meta/Facebook AI
	{
		patterns: []string{"meta-externalagent", "meta-externalfetcher", "meta-webindexer", "facebookbot"},
		vendor:   "meta",
		botName:  "MetaBot",
		intent:   "training",
	},
	// Bytedance
	{
		patterns: []string{"bytespider", "tiktokspider"},
		vendor:   "bytedance",
		botName:  "Bytespider",
		intent:   "training",
	},
	// Amazon/AWS
	{
		patterns: []string{"amazonbot", "amazon-kendra", "bedrockbot"},
		vendor:   "amazon",
		botName:  "Amazonbot",
		intent:   "search",
	},
	// Apple
	{
		patterns: []string{"applebot-extended", "applebot"},
		vendor:   "apple",
		botName:  "Applebot",
		intent:   "training",
	},
	// DeepSeek
	{
		patterns: []string{"deepseekbot"},
		vendor:   "deepseek",
		botName:  "DeepSeekBot",
		intent:   "training",
	},
	// Mistral
	{
		patterns: []string{"mistralai-user"},
		vendor:   "mistral",
		botName:  "MistralBot",
		intent:   "training",
	},
	// You.com
	{
		patterns: []string{"youbot"},
		vendor:   "you",
		botName:  "YouBot",
		intent:   "search",
	},
	// DuckDuckGo
	{
		patterns: []string{"duckassistbot"},
		vendor:   "duckduckgo",
		botName:  "DuckAssistBot",
		intent:   "search",
	},
	// Phind
	{
		patterns: []string{"phindbot"},
		vendor:   "phind",
		botName:  "PhindBot",
		intent:   "search",
	},
	// AI2
	{
		patterns: []string{"ai2bot"},
		vendor:   "ai2",
		botName:  "AI2Bot",
		intent:   "training",
	},
	// Diffbot
	{
		patterns: []string{"diffbot"},
		vendor:   "diffbot",
		botName:  "Diffbot",
		intent:   "scraping",
	},
	// Huawei
	{
		patterns: []string{"petalbot", "pangubot"},
		vendor:   "huawei",
		botName:  "PetalBot",
		intent:   "search",
	},
}

// Classifier performs AI traffic classification.
type Classifier struct{}

// New creates a new Classifier instance.
func New() *Classifier {
	return &Classifier{}
}

// nonAIBots contains patterns for bots that are NOT AI-related
var nonAIBots = []string{
	"googlebot/",  // Regular Googlebot (not Google-Extended)
	"bingbot",     // Microsoft Bing
	"yandexbot",   // Yandex search (not YandexGPT)
	"slurp",       // Yahoo
	"duckduckbot", // DuckDuckGo regular search (not DuckAssistBot)
	"baiduspider", // Baidu
	"sogou",       // Sogou
	"exabot",      // Exalead
	"ia_archiver", // Internet Archive
	"mj12bot",     // Majestic
	"ahrefsbot",   // Ahrefs
	"semrushbot",  // Semrush (regular, not AI)
	"dotbot",      // Moz
	"rogerbot",    // Moz
}

// Classify analyzes a User-Agent string and returns AI classification.
func (c *Classifier) Classify(userAgent string) Classification {
	if userAgent == "" {
		return Classification{
			IsAI:       false,
			AIVendor:   "",
			BotName:    "",
			Intent:     "user",
			Confidence: "high",
		}
	}

	lowerUA := strings.ToLower(userAgent)

	// First, check if it's a known non-AI bot (regular search engines)
	for _, pattern := range nonAIBots {
		if strings.Contains(lowerUA, pattern) {
			return Classification{
				IsAI:       false,
				AIVendor:   "",
				BotName:    "",
				Intent:     "search_engine",
				Confidence: "high",
			}
		}
	}

	// Check against known AI bot signatures
	for _, bot := range knownBots {
		for _, pattern := range bot.patterns {
			if strings.Contains(lowerUA, pattern) {
				return Classification{
					IsAI:       true,
					AIVendor:   bot.vendor,
					BotName:    bot.botName,
					Intent:     bot.intent,
					Confidence: "high",
				}
			}
		}
	}

	// Check for generic bot indicators (low confidence AI detection)
	genericBotPatterns := []string{"bot", "crawler", "spider", "scraper", "fetch"}
	for _, pattern := range genericBotPatterns {
		if strings.Contains(lowerUA, pattern) {
			return Classification{
				IsAI:       true,
				AIVendor:   "unknown",
				BotName:    "GenericBot",
				Intent:     "unknown",
				Confidence: "low",
			}
		}
	}

	// Not detected as AI/bot traffic
	return Classification{
		IsAI:       false,
		AIVendor:   "",
		BotName:    "",
		Intent:     "user",
		Confidence: "high",
	}
}

// ClassifyBatch classifies multiple User-Agent strings.
func (c *Classifier) ClassifyBatch(userAgents []string) []Classification {
	results := make([]Classification, len(userAgents))
	for i, ua := range userAgents {
		results[i] = c.Classify(ua)
	}
	return results
}
