window.CARINTEL_CONFIG = {
  AFFILIATE: {
    TARIFCHECK_KREDIT_URL: "https://a.partner-versicherung.de/click.php?partner_id=204798&ad_id=15&deep=kredit",
    TARIFCHECK_VERSICHERUNG_URL: "https://a.partner-versicherung.de/click.php?partner_id=204798&ad_id=15&deep=kfz-versicherung",
    CARVERTICAL_BASE_URL: "https://www.carvertical.deal/3C3SW91/5MJ263/?source_id=AFF&sub1=carintel",
    CARVERTICAL_VIN_URL: "https://www.carvertical.deal/3C3SW91/5MJ263/?uid=37&source_id=AFF&sub1=carintel&sub3=",
    getCarVerticalUrl: function(vin) {
        if (vin && vin.trim().length > 0) {
            return this.CARVERTICAL_VIN_URL + encodeURIComponent(vin.trim());
        }
        return this.CARVERTICAL_BASE_URL;
    }
  }
};
