window.CARINTEL_CONFIG = {
  AFFILIATE: {
    TARIFCHECK_KREDIT_URL: "https://a.partner-versicherung.de/click.php?partner_id=204798&ad_id=15&deep=kredit",
    TARIFCHECK_VERSICHERUNG_URL: "https://a.partner-versicherung.de/click.php?partner_id=204798&ad_id=15&deep=kfz-versicherung",
    CARVERTICAL_URL: "https://www.carvertical.com/de/landing/v3"
  },
  affiliates: {
    carvertical: {
      partnerId: "", // e.g. "TEST_ID"
      getVinCheckUrl: function(vin) {
        const baseUrl = window.CARINTEL_CONFIG.AFFILIATE.CARVERTICAL_URL;
        const cleanVin = vin ? encodeURIComponent(vin) : '';
        
        if (this.partnerId) {
          return `${baseUrl}?a=${encodeURIComponent(this.partnerId)}&vin=${cleanVin}`;
        }
        
        // Neutral fallback if no partner ID is set
        if (cleanVin) {
            return `https://www.carvertical.com/de/pre-check?vin=${cleanVin}`;
        }
        return baseUrl;
      }
    }
  }
};
