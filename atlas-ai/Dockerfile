# ── Stage 1: Build dependencies ──────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies for psycopg2 and other compiled packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies into a target directory for copying
COPY atlas-ai/requirements.txt requirements.txt
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Generate the Python gRPC bindings from the single shared contract.
COPY proto/ /proto/
RUN mkdir -p /install-proto/proto && \
    PYTHONPATH=/install/lib/python3.12/site-packages \
    python -m grpc_tools.protoc -I/proto \
      --python_out=/install-proto/proto \
      --grpc_python_out=/install-proto/proto \
      /proto/atlas.proto

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Runtime dependency for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Run as root to avoid docker volume permission issues
# RUN useradd -m -u 1001 atlas
# USER atlas

# Copy application source
COPY --chown=atlas:atlas atlas-ai/ /app/atlas-ai/
COPY --from=builder /install-proto/proto /app/atlas-ai/proto

WORKDIR /app/atlas-ai

EXPOSE 50051

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import grpc; channel = grpc.insecure_channel('localhost:50051'); \
  grpc.channel_ready_future(channel).result(timeout=5)" || exit 1

CMD ["python", "main.py"]
