import { Users } from "@prisma/client";

export interface UserStore {
  profile?: Omit<Users, "passwd"> | null;
}
