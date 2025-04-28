#!/usr/bin/env bash

sudo certbot \
    -n \
    -d 'api.barcodedrop.com' \
    --nginx \
    --agree-tos \
    --email 'petervschorn@gmail.com'
