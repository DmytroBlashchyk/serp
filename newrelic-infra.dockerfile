FROM newrelic/infrastructure:latest
RUN apk add --no-cache gettext
ADD /newrelic-infra/newrelic-infra.yml.template /etc/newrelic-infra.yml.template
ENTRYPOINT ["/bin/sh", "-c", "envsubst < /etc/newrelic-infra.yml.template > /etc/newrelic-infra.yml && exec /usr/bin/newrelic-infra"]
