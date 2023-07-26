import type { Env } from "@/lib/env";
import type { PrismaClient } from "@prisma/client";
import type { YogaInitialContext } from "graphql-yoga";

export type Context = YogaInitialContext & { prisma: PrismaClient; env: Env };
