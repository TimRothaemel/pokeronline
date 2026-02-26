# Online Poker Game

## Projektbeschreibung
Dieses Projekt ist ein Online-Pokerspiel, das mit **JavaScript**, **HTML**, **CSS** und **Supabase** entwickelt wird. Ziel ist es, ein interaktives Multiplayer-Spiel zu erstellen, bei dem Spieler über das Internet gegeneinander antreten können. Das Projekt dient primär als Übung im Informatikunterricht, soll aber auch ein vollständiges, spielbares Poker-Erlebnis bieten.

Spieler können:
- An einem virtuellen Pokertisch Platz nehmen.
- Echtzeit-Pokerpartien gegen andere Spieler spielen.

## Technologien

### Frontend
- **HTML**: Struktur der Webseite, Darstellung von Tischen, cards und Buttons.
- **CSS**: Styling der Webseite, inklusive responsivem Layout und Animationen.
- **JavaScript**: Spiel-Logik, Benutzerinteraktionen, cardsausgabe und Echtzeit-Updates.

### Backend & Datenbank
- **Supabase**: Echtzeit-Datenbank und Authentifizierung. Supabase wird genutzt für:
  - Speicherung von Spielständen und Tischinformationen
  - Echtzeit-Synchronisation zwischen Spielern

### Weitere Tools
- **Git**: Versionskontrolle.
- **Visual Studio Code**: Entwicklungsumgebung.
- **npm / yarn**: Paketverwaltung für JavaScript-Module (falls nötig).

## Funktionen
1. **Benutzerverwaltung**
   - Registrierung & Login über Supabase Auth.
   - Speicherung von Benutzername, E-Mail und Passwort.

2. **Poker-Logik**
   - Klassische Texas Hold'em Regeln.
   - cards mischen, austeilen und Runde durchführen.
   - Verwaltung von Chips, Einsätzen, Pots und Gewinnerberechnung.

3. **Multiplayer & Echtzeit**
   - Spieler können sich zu Tischen verbinden.
   - Echtzeit-Synchronisation aller Spielaktionen via Supabase Realtime.
   - Live-Updates für Einsätze, cards und Spielzüge.

## Zielsetzung
- Erstellung eines voll funktionsfähigen Online-Pokerspiels.
- Praktische Anwendung von Web-Technologien (Frontend + Backend).
- Erfahrung mit Echtzeit-Kommunikation und Datenbanken.
- Erweiterbarkeit: Das Projekt kann später um Features wie KI-Gegner, Lobby-System oder Turniere erweitert werden.