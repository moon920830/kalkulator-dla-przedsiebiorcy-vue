export default {
  VAT_VALUES: [
    {
      label: '0%',
      value: 0,
    },
    {
      label: '5%',
      value: 5,
    },
    {
      label: '8%',
      value: 8,
    },
    {
      label: '23%',
      value: 23,
    },
  ],
  BASIC_INTEREST_RATE: 13,
  LOCALE_DATE: {
    /* starting with Sunday */
    days: 'Poniedziałek_Wtorek_Środa_Czwartek_Piątek_Sobota_Niedziela'.split('_'),
    daysShort: 'pon._wt._śr._czw._pt._sob._niedz.'.split('_'),
    months: 'Styczeń_Luty_Marzec_Kwiecień_Maj_Czerwiec_Lipiec_Sierpień_Wrzesień_Październik_Listopad_Grudzień'.split('_'),
    monthsShort: 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru'.split('_'),
    firstDayOfWeek: 1,
  },
  COLORS: {
    INVOICE: '#ed6d13',
    INTEREST: '#ed9113',
  },
}
