#!/bin/sh

set -e
set -u

# Fetch test data required by src/lib/adapter.spec.ts

echo "Removing old data files..."
rm -f card_cycles.json card_sets.json cards.json factions.json printings.json netrunnerdb.sqlite3

echo "Downloading Card Cycle data..."
curl -g --output card_cycles.json 'https://api.netrunnerdb.com/api/v3/public/card_cycles?page[size]=1000'

echo "Downloading Card Set data..."
curl -g --output card_sets.json 'https://api.netrunnerdb.com/api/v3/public/card_sets?page[size]=1000'

echo "Downloading Card data..."
curl -g --output cards.json 'https://api.netrunnerdb.com/api/v3/public/cards?page[size]=5000'

echo "Downloading Faction data..."
curl -g --output factions.json 'https://api.netrunnerdb.com/api/v3/public/factions?page[size]=1000'

echo "Downloading Printing data..."
curl -g --output printings.json 'https://api.netrunnerdb.com/api/v3/public/printings?page[size]=5000'

echo "Downloading latest published database from NetrunnerDB..."
DB_URL=$(curl https://api.netrunnerdb.com/api/v3/public/published_databases 2>/dev/null | jq '.data[0].attributes.url' | sed 's/"//g')

curl -o netrunnerdb.sqlite3.gz $DB_URL
gunzip netrunnerdb.sqlite3.gz

echo "Fetched all data."
ls -lh card_cycles.json card_sets.json cards.json factions.json printings.json netrunnerdb.sqlite3
