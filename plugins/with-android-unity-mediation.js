// Minimal Expo config plugin: add Android Unity mediation deps + gma_ad_services_config.xml
const fs = require('fs');
const path = require('path');
const { withAppBuildGradle, withDangerousMod, createRunOncePlugin } = require('@expo/config-plugins');

function injectDependencies(src, lines, isKts) {
  // すでに入ってたら何もしない（冪等）
  const missing = lines.filter((l) => !src.includes(l));
  if (missing.length === 0) return src;

  // dependencies { ... } を探して直後に差し込む
  const match = src.match(/dependencies\s*\{/);
  if (!match) return src; // 見つからなければ何もしない（安全運転）

  return src.replace(/dependencies\s*\{/, (m) => `${m}\n    ${missing.join('\n    ')}\n`);
}

const withAndroidUnityMediation = (config, props = {}) => {
  const {
    playServicesAds = '24.5.0',
    unitySdk = '4.16.0',
    unityAdapter = '4.16.0.0',
    // true: 毎回上書き / false: 無ければ作成
    overwriteXml = false,
  } = props;

  // 1) build.gradle(.kts) に implementation を注入
  config = withAppBuildGradle(config, (cfg) => {
    const isKts = cfg.modResults.language === 'kts'; // .kts なら true
    const impl = (g, a, v) => (isKts
      ? `implementation("${g}:${a}:${v}")`
      : `implementation "${g}:${a}:${v}"`);

    const lines = [
      impl('com.google.android.gms', 'play-services-ads', playServicesAds),
      impl('com.unity3d.ads', 'unity-ads', unitySdk),
      impl('com.google.ads.mediation', 'unity', unityAdapter),
    ];

    cfg.modResults.contents = injectDependencies(cfg.modResults.contents, lines, isKts);
    return cfg;
  });

  // 2) res/xml/gma_ad_services_config.xml を作る
  config = withDangerousMod(config, [
    'android',
    (cfg) => {
      const xmlDir = path.join(cfg.modRequest.projectRoot, 'android', 'app', 'src', 'main', 'res', 'xml');
      const xmlPath = path.join(xmlDir, 'gma_ad_services_config.xml');
      const content =
`<?xml version="1.0" encoding="utf-8"?>
<ad-services-config>
  <attribution allowAllToAccess="true" />
  <topics allowAllToAccess="true" />
  <custom-audiences allowAllToAccess="true" />
</ad-services-config>
`;

      fs.mkdirSync(xmlDir, { recursive: true });
      if (overwriteXml || !fs.existsSync(xmlPath)) {
        fs.writeFileSync(xmlPath, content, 'utf8');
        // console.log('[with-android-unity-mediation] wrote', xmlPath);
      }
      return cfg;
    },
  ]);

  return config;
};

module.exports = createRunOncePlugin(
  withAndroidUnityMediation,
  'with-android-unity-mediation',
  '1.0.0'
);