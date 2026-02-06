// Google API Type Declarations for TheMAG.dev

declare namespace gapi {
  function load(api: string, callback: () => void): void;

  namespace client {
    function init(config: {
      apiKey?: string;
      discoveryDocs?: string[];
    }): Promise<void>;

    function setToken(token: { access_token: string }): void;

    namespace drive {
      namespace files {
        function list(params: {
          q?: string;
          spaces?: string;
          fields?: string;
          orderBy?: string;
          pageSize?: number;
          pageToken?: string;
        }): Promise<{
          result: {
            files?: Array<{
              id?: string;
              name?: string;
              mimeType?: string;
              size?: string;
              modifiedTime?: string;
              createdTime?: string;
              parents?: string[];
              webViewLink?: string;
              iconLink?: string;
            }>;
            nextPageToken?: string;
          };
        }>;

        function create(params: {
          resource?: {
            name?: string;
            mimeType?: string;
            parents?: string[];
          };
          fields?: string;
        }): Promise<{
          result: {
            id?: string;
            name?: string;
            mimeType?: string;
            modifiedTime?: string;
            createdTime?: string;
          };
        }>;

        function get(params: {
          fileId: string;
          alt?: string;
          fields?: string;
        }): Promise<{
          result: {
            id?: string;
            name?: string;
            mimeType?: string;
            size?: string;
            modifiedTime?: string;
          };
          body?: string;
        }>;

        function update(params: {
          fileId: string;
          resource?: {
            name?: string;
          };
          addParents?: string;
          removeParents?: string;
        }): Promise<{
          result: {
            id?: string;
            name?: string;
          };
        }>;

        function deleteFile(params: { fileId: string }): Promise<void>;
      }

      namespace about {
        function get(params: { fields: string }): Promise<{
          result: {
            storageQuota?: {
              limit?: string;
              usage?: string;
              usageInDrive?: string;
            };
          };
        }>;
      }
    }
  }
}

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        callback: (response: TokenResponse) => void;
        requestAccessToken(config?: { prompt?: string }): void;
      }

      interface TokenResponse {
        access_token: string;
        expires_in: number;
        token_type: string;
        scope: string;
        error?: string;
      }

      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
      }): TokenClient;

      function revoke(token: string, callback: () => void): void;
    }
  }
}
