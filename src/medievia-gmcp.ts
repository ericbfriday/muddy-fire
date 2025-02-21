import { z } from "zod";

export const VitalsSchema = z.object({
  hp: z.number().safe(),
  mana: z.number().safe(),
  maxHp: z.number().positive(),
  maxMana: z.number().positive(),
  maxMv: z.number().safe(),
  mounted: z.number().min(0).max(1), // 0 = false, 1 = true
  mv: z.number().safe(),
});
export const CharSchema = z.object({
  Char: z.object({ Vitals: VitalsSchema }),
});
export const DiscordInfoSchema = z.object({
  applicationid: z.string().default("1321530294448427139"),
  inviteurl: z.string().url().default("https://discord.gg/WanRtHwxsR"),
});
export const DiscordStatusSchema = z.object({
  game: z.string(),
  partymax: z.number().safe().default(0),
  partysize: z.number().safe().default(0),
  smallimage: z.array(z.string()),
  smallimagetext: z.string().default("Medievia Online"),
  starttime: z.string(),
});
export const ExternalDiscordSchema = z.object({
  Info: DiscordInfoSchema,
  Status: DiscordStatusSchema,
});
// const ExitValues: Readonly<string[]> = ["n", "s", "e", "w", "u", "d"] as const;

export const ExitsSchema = z.object({
  n: z.string().optional(),
  s: z.string().optional(),
  e: z.string().optional(),
  w: z.string().optional(),

  u: z.string().optional(),
  d: z.string().optional(),
});
export const RoomInfoSchema = z.object({
  exits: ExitsSchema,

  name: z.string().describe("The name of the current room"),
  pk: z.enum(["LPK", "NPK", "CPK"]).describe("The PK type of the room"),
});
export const RoomSchema = z.object({
  Room: z.object({ Info: RoomInfoSchema }),
});

export const GMCPSchema = z.object({
  Char: CharSchema,
  External: ExternalDiscordSchema,
  Room: RoomSchema,
});

/**
 * {
  Char = {
    Vitals = {
      br = 100,
      hp = 805,
      mana = 825,
      maxHp = 805,
      maxMana = 825,
      maxMv = 610,
      mounted = 0,
      mv = 610
    }
  },
  External = {
    Discord = {
      Info = {
        applicationid = "1321530294448427139",
        inviteurl = "https://discord.gg/WanRtHwxsR"
      },
      Status = {
        game = "Medievia",
        partymax = 0,
        partysize = 0,
        smallimage = { "server-icon" },
        smallimagetext = "Medievia Online",
        starttime = "1739892084"
      }
    }
  },
  Room = {
    Info = {
      exits = {
        e = "The Main Courtyard of Medievia",
        n = "The Main Courtyard of Medievia",
        s = "The Main Courtyard of Medievia",
        u = "The Castle Stairs",
        w = "The Main Courtyard of Medievia",
        d = "The Sewer"
      },
      name = "The U-Store-It Facility",
      pk = "LPK"
    }
  }
}
 */
