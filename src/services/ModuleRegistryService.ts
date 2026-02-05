import googleDriveService from './GoogleDriveService';

const REGISTRY_FILE = 'features.json';

class ModuleRegistryService {
  constructor() {
    googleDriveService.onSyncStatusChange((status) => {
      if (status.connected) {
        this.syncRegistry().catch(() => {});
      }
    });
  }

  private async syncRegistry(): Promise<void> {
    try {
      const response = await fetch('/features.json');
      if (!response.ok) return;
      const payload = await response.text();
      const { modulesId } = await googleDriveService.getFolderIds();
      const file = await googleDriveService.upsertFileInFolder(
        modulesId,
        REGISTRY_FILE,
        payload,
        'application/json'
      );
      if (file?.id) {
        await googleDriveService.getPublicDownloadUrl(file.id);
      }
    } catch {
      // Ignore registry sync errors.
    }
  }
}

export const moduleRegistryService = new ModuleRegistryService();
export default moduleRegistryService;
