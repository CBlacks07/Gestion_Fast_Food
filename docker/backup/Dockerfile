FROM postgres:15-alpine

# Installer supercronic (cron pour Docker)
RUN apk add --no-cache curl && \
    curl -fsSLO https://github.com/aptible/supercronic/releases/download/v0.2.29/supercronic-linux-amd64 && \
    chmod +x supercronic-linux-amd64 && \
    mv supercronic-linux-amd64 /usr/local/bin/supercronic && \
    apk del curl

# Copier le script de backup
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Créer le fichier crontab (toutes les 12 heures à 00:00 et 12:00)
RUN echo "0 0,12 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1" > /etc/crontab

# Créer le répertoire de logs
RUN mkdir -p /var/log && touch /var/log/backup.log

# Lancer un backup immédiat au démarrage puis démarrer supercronic
CMD /usr/local/bin/backup.sh && \
    echo "Backup service started. Schedule: Every 12 hours (00:00 and 12:00)" && \
    echo "Logs are written to /var/log/backup.log" && \
    supercronic /etc/crontab
