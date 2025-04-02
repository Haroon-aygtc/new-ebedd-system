export interface SelectedElement {
  name: string;
  selector: string;
  type: string;
  attribute?: string;
}

export interface ScrapingConfig {
  paginationSelector?: string;
  maxPages?: number;
  delay?: number;
  followLinks?: boolean;
  linkSelector?: string;
  maxDepth?: number;
  headless?: boolean;
}
