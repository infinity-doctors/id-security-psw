#!/bin/sh

# Start nginx in background
nginx -g "daemon off;" &

# Keep container running
wait 