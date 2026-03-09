import type { ComponentType } from "react";
import type { ProviderStatus } from "@/store/useProvidersStore";

export interface ProviderMeta {
  id: string;
  name: string;
  icon: ComponentType<any>;
  type: "CLOUD" | "LOCAL";
  description: string;
  color: string;
}

export interface ProviderToolRoute {
  id: string;
  name: string;
  icon: ComponentType<any>;
  description: string;
}

export interface ProviderCardState {
  provider: ProviderMeta;
  apiKey: string;
  showKey: boolean;
  status: ProviderStatus;
  isGlobalDefault: boolean;
}
