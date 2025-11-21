
export interface ColorStep {
  id: string;
  color: string;
  duration: number; // Duration in seconds
}

export interface SavedPattern {
  id: string;
  name: string;
  steps: ColorStep[];
}
