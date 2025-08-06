FROM mcr.microsoft.com/playwright:v1.52.0 AS playwright_certs

SHELL ["/bin/bash", "-o", "pipefail", "-O", "extglob", "-c"]
ADD 'https://gitlab.mitre.org/mitre-scripts/mitre-pki/raw/master/os_scripts/install_certs.sh' /tmp/install_certs.sh
RUN MODE=ubuntu sh /tmp/install_certs.sh

FROM playwright_certs AS test_packages

WORKDIR /playwright

COPY e2e/package*.json .
RUN npm install

FROM playwright_certs AS node_packages

WORKDIR /app

COPY package*.json .
RUN npm install

FROM node_packages AS app_build
COPY index.* .
COPY *.config.js .
COPY *.cjs .
COPY *.xml .
COPY public ./public
COPY src ./src
RUN npm run build

FROM test_packages AS test_run
RUN mkdir playwright \
&& cd playwright \
&& mkdir downloads \
&& mkdir .auth \
&& cd ..
COPY e2e .
COPY --from=app_build /app/dist /dist
CMD npx playwright test import --project=chromium -gv "default|mdm" -x
