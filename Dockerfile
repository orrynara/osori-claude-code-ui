FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Create .claude directory and inject credentials at startup
RUN mkdir -p /root/.claude

# Startup script that writes credentials from env vars then starts server
RUN echo '#!/bin/bash\n\
if [ -n "$CLAUDE_OAUTH_ACCESS_TOKEN" ]; then\n\
  mkdir -p /root/.claude\n\
  cat > /root/.claude/.credentials.json <<CRED\n\
{"claudeAiOauth":{"accessToken":"$CLAUDE_OAUTH_ACCESS_TOKEN","refreshToken":"$CLAUDE_OAUTH_REFRESH_TOKEN","expiresAt":9999999999999,"scopes":["user:file_upload","user:inference","user:mcp_servers","user:profile","user:sessions:claude_code"],"subscriptionType":"max","rateLimitTier":"default_claude_max_5x"}}\n\
CRED\n\
  echo "[INFO] Claude Pro credentials configured"\n\
fi\n\
exec node server/index.js' > /app/start.sh && chmod +x /app/start.sh

# Expose port (Railway sets PORT dynamically)
EXPOSE 8080

# Start with credentials injection
CMD ["/app/start.sh"]
