FROM python:3.11-slim


# --- OCI Metadata Labels (for Artifact Registry) ---
# LABEL org.opencontainers.image.title=""
# LABEL org.opencontainers.image.description=""
# LABEL org.opencontainers.image.version=""
# LABEL org.opencontainers.image.authors="Dipanjan Paul"
# LABEL org.opencontainers.image.licenses=""
# LABEL org.opencontainers.image.vendor=""
# LABEL org.opencontainers.image.source=""
# ---------------------------------------------------


WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variable for production
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["uv", "run", "python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080", "--ws-ping-timeout", "60", "--ws-ping-interval", "20", "--timeout-keep-alive", "75"]
