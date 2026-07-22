import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// Stores every ending reached by any player, used to compute a global
// "Ending Codex" completion board (how many times each of the 5 endings
// has been unlocked across all players of Aetherfall).
export const gameEndings = pgTable("game_endings", {
  id: serial("id").primaryKey(),
  endingKey: text("ending_key").notNull(), // "true" | "good" | "normal" | "bad" | "secret"
  playerName: text("player_name"),
  finalHp: integer("final_hp").notNull().default(0),
  finalMp: integer("final_mp").notNull().default(0),
  finalKarma: integer("final_karma").notNull().default(0),
  fragments: integer("fragments").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

