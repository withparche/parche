/**
 * The virtual modules the plugin serves: the id a parche or a route imports
 * (`parche:…`) and the id Vite keeps once resolved (`\0`-prefixed, so no
 * other plugin touches it). Every module the registry maps to a file on
 * disk (`parche:widgets/…`, `parche:elements/…`, `parche:config`) resolves
 * the same way, by prefix; the ids named here are generated instead.
 */
export const PARCHE_PREFIX = 'parche:';
export const VIRTUAL_PREFIX = '\0parche:';
export const WIDGET_MAP_ID = 'parche:registry/widgets';
export const WIDGET_MAP_VIRTUAL = '\0parche:registry/widgets';
export const TEMPLATE_MAP_ID = 'parche:registry/templates';
export const TEMPLATE_MAP_VIRTUAL = '\0parche:registry/templates';
export const I18N_CONFIG_ID = 'parche:config/i18n';
export const I18N_CONFIG_VIRTUAL = '\0parche:config/i18n';
export const FONTS_CONFIG_ID = 'parche:config/fonts';
export const FONTS_CONFIG_VIRTUAL = '\0parche:config/fonts';
export const ASSETS_CONFIG_ID = 'parche:config/assets';
export const ASSETS_CONFIG_VIRTUAL = '\0parche:config/assets';
export const HEAD_CONFIG_ID = 'parche:config/head';
export const HEAD_CONFIG_VIRTUAL = '\0parche:config/head';
export const THEMES_CONFIG_ID = 'parche:config/themes';
export const THEMES_CONFIG_VIRTUAL = '\0parche:config/themes';
export const STYLES_CONFIG_ID = 'parche:config/styles';
export const STYLES_CONFIG_VIRTUAL = '\0parche:config/styles';
export const TOKEN_OVERRIDES_ID = 'parche:config/token-overrides.css';
export const TOKEN_OVERRIDES_VIRTUAL = '\0parche:config/token-overrides.css';
export const LAYOUT_CONFIG_ID = 'parche:config/layout';
export const LAYOUT_CONFIG_VIRTUAL = '\0parche:config/layout';
export const WIDGET_SCHEMAS_ID = 'parche:registry/widgetSchemas';
export const WIDGET_SCHEMAS_VIRTUAL = '\0parche:registry/widgetSchemas';
export const WIDGET_PROPS_ID = 'parche:registry/widgetProps';
export const WIDGET_PROPS_VIRTUAL = '\0parche:registry/widgetProps';
export const ELEMENTS_ID = 'parche:registry/elements';
export const ELEMENTS_VIRTUAL = '\0parche:registry/elements';
export const RESOLVERS_ID = 'parche:registry/resolvers';
export const RESOLVERS_VIRTUAL = '\0parche:registry/resolvers';
export const DEV_TOOLS_ID = 'parche:registry/dev';
export const DEV_TOOLS_VIRTUAL = '\0parche:registry/dev';
export const ENTRY_URLS_ID = 'parche:registry/urls';
export const ENTRY_URLS_VIRTUAL = '\0parche:registry/urls';
export const APP_CONFIG_PREFIX = 'parche:app/';
export const APP_CONFIG_VIRTUAL_PREFIX = '\0parche:app/';
