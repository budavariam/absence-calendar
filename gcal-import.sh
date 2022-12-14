#!/bi/bash

SRC=${1:-~/Downloads/absences.json}
TGT="./data.json"
cp "$SRC" ./export.json
jq '[.items[] | {"who": .summary, "start": .start.date,  "end": .end.date}]' ./export.json > "$TGT"
cat "$TGT" | pbcopy