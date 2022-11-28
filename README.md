# Absence Calendar

I needed a way to visualize calendar data that span multiple days,
and filter those events that I'm not interested in.

[DEMO](https://budavariam.github.io/absence-calendar)

```bash
npm run start
```

## Work from google calendar

```bash
jq '[.items[] | {"who": .summary, "start": .start.date,  "end": .end.date}]' ~/export.json > ~/data.json
cat ~/data.json | pbcopy
```
