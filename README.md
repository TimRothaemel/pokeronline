# PokerOnline

Ein einfaches Online-Pokerprojekt und Lernprojekt mit HTML, CSS, JavaScript und Supabase.

## Beschreibung

`PokerOnline` ist eine Webanwendung zum Erstellen und Spielen einfacher Pokerrunden. Die Seite ist als Fullscreen-Erlebnis aufgebaut und bietet eine Spiel-Erstellseite ohne klassische Karten-Kachelstruktur.

## Features

- Vollbild-Layout für Spielseiten
- Spiel-Erstellseite mit Optionen für Spieltyp, Einsatz und Spieler
- Rechtliche Impressumsseite
- Gestaltet mit sauberem HTML/CSS
- Backend-Integration geplant / teilweise umgesetzt mit Supabase

## Technologie

- HTML
- CSS
- JavaScript
- Supabase

## Installation

1. Repository klonen
   ```bash
   git clone https://github.com/<dein-nutzername>/pokeronline.git
   cd pokeronline
   ```

2. Projekt lokal öffnen
   - `index.html` im Browser öffnen
   - oder lokalen Webserver starten:
     ```bash
     python3 -m http.server 8000
     ```

3. Mit Supabase verbinden
   - Supabase-Projekt erstellen
   - Konfigurationsdateien mit Projekt-URL und API-Schlüssel ergänzen

## Struktur

- `src/index.html` – Startseite / Spiel erstellen
- `src/pages/legal/impressum.html` – Impressum
- `src/main.css` – globale Styles

## Weiterentwicklung

- Spiel-Logik erweitern
- Supabase-Authentifizierung und Datenbankanbindung
- Mehrseitiges Navigationsmenü
- Responsives Layout für mobile Geräte

