
export enum View {
  LANDING = 'LANDING',
  CAMERA = 'CAMERA',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT'
}

export interface AppState {
  view: View;
  capturedImage: string | null;
  processedImage: string | null;
  error: string | null;
}
