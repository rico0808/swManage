interface Profile {
  role: string;
}

export interface UserStore {
  profile?: Profile | null;
}
