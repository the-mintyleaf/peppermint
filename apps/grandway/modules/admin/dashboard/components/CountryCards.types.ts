export interface CountryCardsProps {
  /** Only the fiscal year scopes this strip — each card supplies its own country. */
  fiscalYear: string;
  /** The header filter's current country id, or `""` for all. Highlights the matching card. */
  selectedCountry: string;
  /** Sets the header's country filter. Activating the selected card again clears it. */
  onSelectCountry: (countryId: string) => void;
}
