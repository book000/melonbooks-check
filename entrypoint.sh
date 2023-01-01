#!/bin/sh

# 5分毎に確認
while true; do
    php /app/main.php
    sleep 300
done
