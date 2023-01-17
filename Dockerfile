FROM php:7.4-cli

# /etc/ssl/openssl.cnf の CipherString = DEFAULT@SECLEVEL=2 をコメントアウトする

# hadolint ignore=DL3008
RUN sed -i -e 's/^CipherString/#CipherString/' /etc/ssl/openssl.cnf && \
  apt-get update && \
  apt-get install -y --no-install-recommends libonig-dev && \
  rm -rf /var/lib/apt/lists/* && \
  docker-php-ext-install mbstring

WORKDIR /app
COPY main.php .
COPY entrypoint.sh .

RUN chmod a+x entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
