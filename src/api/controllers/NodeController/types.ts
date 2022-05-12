import { Nodes } from "@/api/entity/Nodes";
import { Servers } from "@/api/entity/Servers";

export type NodesItem = _.Omit<Nodes, "relayID" | "landID"> & {
  relay: Servers;
  land: Servers;
};
