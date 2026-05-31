export interface INation {
  alpha2: string;
  alpha3: string;
  name: string;
  l10n: string;
  num: string;
  s: string;
  r?: string;   // optional, present in some entries
  sr?: string;  // optional, present in some entries
}