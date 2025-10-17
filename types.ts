
export enum ReportType {
  TreePlantation = 'TREE',
  PollutionHotspot = 'POLLUTION',
}

export interface Report {
  id: string;
  type: ReportType;
  latitude: number;
  longitude: number;
  locationName: string;
  description: string;
  reportedBy: string;
  timestamp: string;
}
