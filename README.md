## Setup

```sh
npm i
npm start  # development
npm run build  # production
```

Code notes:

Als Locatie een [x, y] array is ipv een string, wordt dat de locatie van de pin van die vakantie.
die krijg je met maps.google.com, rechts klikken, daar coordinaten nemen.
De vakanties moeten een unieke naam hebben, daarop wordt geidentificeerd.

Nieuwe vakanties moeten in een folder 'new' komen.
De converter updated output_dry.json.

commands om het te doen zijn:
cd ~/js-samples/src
python3 converter.py
npm run build
cd ..
git add *
git commit -m 'added more vakanties'
git push

