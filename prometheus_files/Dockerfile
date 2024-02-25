

FROM alpine:3.14 as builder

workdir /app

# USER root

ARG HIDRA_AUTH_BASIC_PASSWORD
ENV HIDRA_AUTH_BASIC_PASSWORD=$HIDRA_AUTH_BASIC_PASSWORD

# install htpasswd
RUN apk add --no-cache apache2-utils

COPY ./gen_pass.sh /app/gen_pass.sh
COPY ./configs/prometheus.yml /app/prometheus.yml

RUN chmod +x /app/gen_pass.sh

# USER nobody

RUN /bin/sh -c /app/gen_pass.sh

RUN cat /app/web.yml
RUN cat /app/passwdweb

FROM prom/prometheus:v2.38.0 as production

COPY --from=builder /app/web.yml /etc/prometheus/web.yml
COPY --from=builder /app/passwdweb /etc/prometheus/passwdweb
COPY --from=builder /app/prometheus.yml /etc/prometheus/prometheus.yml

RUN cat /etc/prometheus/web.yml
RUN cat /etc/prometheus/passwdweb

# ENTRYPOINT [ "/bin/prometheus" ]

