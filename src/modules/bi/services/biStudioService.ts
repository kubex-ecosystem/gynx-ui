import { HTTP_CREDENTIALS } from "@/core/http/auth";
import { httpClient } from "@/core/http/client";
import { httpEndpoints } from "@/core/http/endpoints";
import type {
  BICatalogStatus,
  ExportBoardBundleRequest,
  GenerateBoardRequest,
  GenerateBoardResponse,
} from "@/modules/bi/types";

export const biStudioService = {
  async getCatalogStatus(): Promise<BICatalogStatus> {
    return httpClient.get<BICatalogStatus>(httpEndpoints.bi.catalogStatus, {
      credentials: HTTP_CREDENTIALS.session,
    });
  },

  async generateBoard(
    payload: GenerateBoardRequest,
  ): Promise<GenerateBoardResponse> {
    return httpClient.post<GenerateBoardResponse, GenerateBoardRequest>(
      httpEndpoints.bi.generateBoard,
      payload,
      {
        credentials: HTTP_CREDENTIALS.session,
        timeoutMs: 60000,
      },
    );
  },

  async exportBoardBundle(payload: ExportBoardBundleRequest): Promise<Blob> {
    return httpClient.post<Blob, ExportBoardBundleRequest>(
      httpEndpoints.bi.exportBoard,
      payload,
      {
        credentials: HTTP_CREDENTIALS.session,
        parseAs: "blob",
        timeoutMs: 30000,
      },
    );
  },
};
