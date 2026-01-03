Empire Website (Static)

Files:
- index.html (Home)
- court.html (The Court)
- codex.html (Lore + Constitution v1)
- map.html (Embed your BlueMap/Dynmap URL)
- regions.html + region.html (Regions directory + detail)
- decrees.html + post.html (Decrees/Chronicles with filters + detail)
- data/posts.json, data/regions.json (edit these to add content)
- assets/empire-banner.png (your banner)

How to run:
- Open index.html in a browser (for full JSON loading you may need a local server).
  Quick local server:
    python -m http.server 8000
  Then open http://localhost:8000/empire_site/index.html

Customize:
- Replace placeholders (Screenshot blocks) with <img src="...">.
- Update YOUR_MAP_URL_HERE in map.html.


Content sources:
- Constitution of the Empire.pdf
- History of the Empire.pdf
