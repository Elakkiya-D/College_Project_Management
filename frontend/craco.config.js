const HTML2PDF_SOURCE_MAP_EXCLUDE = /node_modules[\\/]html2pdf\.js/;

const isSourceMapLoaderRule = (rule) => {
  if (!rule || rule.enforce !== 'pre') return false;
  const uses = Array.isArray(rule.use) ? rule.use : rule.loader ? [{ loader: rule.loader }] : [];
  return uses.some((useEntry) => {
    const loaderName = typeof useEntry === 'string' ? useEntry : useEntry.loader || '';
    return loaderName.includes('source-map-loader');
  });
};

const addExclusion = (rule) => {
  if (!isSourceMapLoaderRule(rule)) return;
  if (!rule.exclude) {
    rule.exclude = HTML2PDF_SOURCE_MAP_EXCLUDE;
  } else if (Array.isArray(rule.exclude)) {
    rule.exclude.push(HTML2PDF_SOURCE_MAP_EXCLUDE);
  } else {
    rule.exclude = [rule.exclude, HTML2PDF_SOURCE_MAP_EXCLUDE];
  }
};

const walkRules = (rules) => {
  if (!Array.isArray(rules)) return;
  rules.forEach((rule) => {
    if (rule.oneOf) {
      walkRules(rule.oneOf);
    }
    addExclusion(rule);
  });
};

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      walkRules(webpackConfig.module.rules);
      return webpackConfig;
    },
  },
};
