FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Install core utilities
RUN apt-get update && apt-get install -y \
    curl git unzip zip build-essential \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install Java 21 and Maven
RUN apt-get update && apt-get install -y \
    openjdk-21-jdk \
    maven \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 (for compiling TypeScript)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Playwright dependencies (for automated E2E testing)
RUN npx playwright install-deps

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

USER ubuntu

