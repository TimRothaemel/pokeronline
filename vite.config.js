import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        createRoom: resolve(__dirname, "src/pages/room/create-room.html"),
        joinRoom: resolve(__dirname, "src/pages/room/join-room.html"),
        lobby: resolve(__dirname, "src/pages/lobby/lobby.html"),
        game: resolve(__dirname, "src/pages/game/game.html"),
        impressum: resolve(__dirname, "src/pages/legal/impressum.html"),
        datenschutz: resolve(__dirname, "src/pages/legal/datenschutz.html"),
      },
    },
  },
});
