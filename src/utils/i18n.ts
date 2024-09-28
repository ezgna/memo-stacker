import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

const i18n = new I18n({
  en: {search: 'Search your logs', memolog: 'MemoLog', export: 'Export', inport: 'Inport', settings: 'Settings'},
  ja: {search: 'メモを検索', memolog: 'メモログ', export: 'エクスポート', inport: 'インポート', settings: '設定'}
})

i18n.locale = getLocales()[0].languageCode ?? 'en';
i18n.enableFallback = true;

export const isJapanese = getLocales()[0].languageCode === 'ja';

export default i18n;