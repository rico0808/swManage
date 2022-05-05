import { prisma } from "@/api/prisma";
import type { Context, OnResult } from "@/types";
import { onResult } from "@/api/utils/tools";
import { Api, ApiConfig, Get, useContext } from "@midwayjs/hooks";
import { Users } from "@prisma/client";
import _ from "lodash";
import { CheckCookie } from "@/api/middleware/middleware";

export const config: ApiConfig = {
  middleware: [CheckCookie],
};

const Path = (code: string) => `/api/user/${code}`;

// 用户信息
export const UserGetProfile = Api(
  Get(Path("profile")),
  async (): OnResult<Omit<Users, "passwd">> => {
    const { session } = useContext<Context>();
    const user = await prisma.users.findUnique({ where: { id: session.id } });
    return onResult(_.omit(user, ["passwd"]));
  }
);
