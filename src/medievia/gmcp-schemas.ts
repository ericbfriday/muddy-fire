import { z } from 'zod';

export const VitalsSchema = z.object({
  hp: z.number().safe(),
  mana: z.number().safe(),
  maxHp: z.number().positive().safe(),
  maxMana: z.number().positive().safe(),
  maxMv: z.number().safe(),
  mounted: z.number().min(0).max(1), // 0 = false, 1 = true
  mv: z.number().safe(),
});
export const AfflicationsSchema = z.object({
  Add: z.object({
    name: z.string(),
    ticks: z.number(),
    modifier: z.string().optional(),
  }),
  Remove: z.string().optional(),
});
export const CharSchema = z.object({
  Vitals: VitalsSchema,
  Afflictions: AfflicationsSchema.optional(),
});
export const DiscordInfoSchema = z.object({
  applicationid: z.string().default('1321530294448427139'),
  inviteurl: z.string().url().default('https://discord.gg/WanRtHwxsR'),
});
export const DiscordStatusSchema = z.object({
  game: z.string().default('Medievia'),
  partymax: z.number().safe().default(0),
  partysize: z.number().safe().default(0),
  smallimage: z.array(z.string()),
  smallimagetext: z.string().default('Medievia Online'),
  starttime: z.string(),
});
export const ExternalDiscordSchema = z.object({
  Info: DiscordInfoSchema,
  Status: DiscordStatusSchema,
});
export const ExitValues = ['n', 's', 'e', 'w', 'u', 'd'] as const;
export const ExitValuesSchema = z
  .set(z.enum(ExitValues))
  .min(0)
  .max(ExitValues.length);
export const ExitSchema = z.record(ExitValuesSchema, z.string().nonempty());
export const RoomInfoSchema = z.object({
  exits: ExitSchema,
  name: z.string().describe('The name of the current room'),
  pk: z.enum(['LPK', 'NPK', 'CPK']).describe('The PK type of the room'),
});
export const RoomSchema = z.object({
  Room: z.object({ Info: RoomInfoSchema }),
});

export const GMCPSchema = z.object({
  Char: CharSchema,
  External: ExternalDiscordSchema,
  Room: RoomSchema,
});

const testValues = [
  {
    Char: {
      Afflictions: { Remove: 'Breathe Water' },
      Vitals: {
        maxMana: 925,
        mounted: 0,
        br: 100,
        maxHp: 891,
        mv: 610,
        mana: 925,
        hp: 891,
        maxMv: 610,
      },
    },
    External: {
      Discord: {
        Info: {
          inviteurl: 'https://discord.gg/WanRtHwxsR',
          applicationid: '1321530294448427139',
        },
        Status: {
          partymax: 0,
          smallimage: ['server-icon'],
          smallimagetext: 'Medievia Online',
          game: 'Medievia',
          starttime: '1740279322',
          partysize: 0,
        },
      },
    },
    Room: {
      Info: {
        exits: {
          s: 'Avadale Road, South of the Main Courtyard',
          e: 'The Main Courtyard of Medievia',
          u: 'On a Wide Rope and Plank Ladder',
          w: 'The Main Courtyard of Medievia',
          n: 'The City of Medievia - Castle Square',
        },
        name: 'The Main Courtyard of Medievia',
        pk: 'LPK',
      },
    },
  },
];
