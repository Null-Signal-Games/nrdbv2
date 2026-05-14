#!/bin/sh

set -e
set -u

# Fetch fresh test data required by src/lib/adapter.spec.ts

echo "Downloading Card Cycle data..."
curl -g 'https://api.netrunnerdb.com/api/v3/public/card_cycles?page[size]=1000' \
  | gzip -9 > test-data/card_cycles.json.gz

echo "Downloading Card Set data..."
curl -g 'https://api.netrunnerdb.com/api/v3/public/card_sets?page[size]=1000' \
  | gzip -9 > test-data/card_sets.json.gz

echo "Downloading Card data..."
curl -g 'https://api.netrunnerdb.com/api/v3/public/cards?page[size]=5000' \
  | gzip -9 > test-data/cards.json.gz

echo "Downloading Faction data..."
curl -g 'https://api.netrunnerdb.com/api/v3/public/factions?page[size]=1000' \
  | gzip -9 > test-data/factions.json.gz

echo "Downloading Format data..."
curl -g 'https://api.netrunnerdb.com/api/v3/public/formats?page[size]=1000' \
  | gzip -9 > test-data/formats.json.gz

echo "Downloading Illustrator data..."
curl -g 'https://api.netrunnerdb.com/api/v3/public/illustrators?page[size]=1000' \
  | gzip -9 > test-data/illustrators.json.gz

echo "Downloading Printing data..."
curl -g 'https://api.netrunnerdb.com/api/v3/public/printings?page[size]=5000' \
  | gzip -9 > test-data/printings.json.gz

echo "Downloading latest published database from NetrunnerDB..."
DB_URL=$(curl https://api.netrunnerdb.com/api/v3/public/published_databases 2>/dev/null \
	| jq '.data[0].attributes.url' | sed 's/"//g')

curl -o netrunnerdb.sqlite3.gz $DB_URL

echo "Fetched all data."
ls -lh test-data/
