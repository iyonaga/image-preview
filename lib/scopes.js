'use babel';

export const expectedScopes = [
  'link.markup.md',
  'markup.underline.link.gfm',
  'meta.property-value.css',
  'meta.property-value.sass',
  'meta.property-value.scss'
];

export const regexPatterns = {
  'markup.underline.link.gfm': /(.*?)(?:\s+|$)/,
  'meta.property-value.css': /\(\s*["']?(.*?)["']?\s*\)/,
  'meta.property-value.scss': /\(\s*["']?(.*?)["']?\s*\)/,
  'meta.property-value.sass': /\(\s*["']?(.*?)["']?\s*\)/
};
