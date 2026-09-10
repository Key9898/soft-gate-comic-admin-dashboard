export type BilingualText = { en: string; mm: string };

export const ABOUT_TEAM_META_ID = 'about-team';

export type AboutTeamMemberRecord = {
  id: string;
  name: BilingualText;
  role: BilingualText;
  photoUrl?: string;
  sortOrder: number;
  published: boolean;
};

export type AboutTeamMemberWrite = {
  name: BilingualText;
  role: BilingualText;
  photoUrl?: string;
  sortOrder: number;
  published: boolean;
};

export type AboutTeamMemberPatch = Partial<AboutTeamMemberWrite>;

export type AboutTeamMetaRecord = {
  deck: BilingualText;
  standInNote: BilingualText;
  standInVisible: boolean;
};

export const DEFAULT_ABOUT_TEAM_META: AboutTeamMetaRecord = {
  deck: {
    en: 'The public-facing studio roles for this portal.',
    mm: 'ဤ portal အတွက် အများပြည်သူသို့ ပြသသော စတူဒီယို ရာထူးများ။',
  },
  standInNote: {
    en: 'Portraits and names are stand-ins until the studio publishes its public roster.',
    mm: 'ပုံတူများနှင့် နာမည်များသည် စတူဒီယိုက အများပြည်သူ စာရင်း မထုတ်မီ ယာယီ အစားထိုးများ ဖြစ်သည်။',
  },
  standInVisible: true,
};

export type AboutTeamStore = {
  list: () => Promise<AboutTeamMemberRecord[]>;
  findById: (id: string) => Promise<AboutTeamMemberRecord | null>;
  create: (input: AboutTeamMemberWrite) => Promise<AboutTeamMemberRecord>;
  update: (id: string, patch: AboutTeamMemberPatch) => Promise<AboutTeamMemberRecord | null>;
  delete: (id: string) => Promise<boolean>;
  getMeta: () => Promise<AboutTeamMetaRecord>;
  upsertMeta: (input: AboutTeamMetaRecord) => Promise<AboutTeamMetaRecord>;
};

export function persistedMember(row: AboutTeamMemberRecord): AboutTeamMemberRecord {
  const next: AboutTeamMemberRecord = {
    id: row.id,
    name: { en: row.name.en, mm: row.name.mm },
    role: { en: row.role.en, mm: row.role.mm },
    sortOrder: row.sortOrder,
    published: row.published,
  };
  if (row.photoUrl) next.photoUrl = row.photoUrl;
  return next;
}

export function publicMeta(row: AboutTeamMetaRecord): AboutTeamMetaRecord {
  return {
    deck: { en: row.deck.en, mm: row.deck.mm },
    standInNote: { en: row.standInNote.en, mm: row.standInNote.mm },
    standInVisible: row.standInVisible,
  };
}

export function compareMember(a: AboutTeamMemberRecord, b: AboutTeamMemberRecord): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}
