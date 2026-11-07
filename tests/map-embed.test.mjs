import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  googleMapsLinkForEmbed,
  parseMapEmbedUrl,
} from '../src/lib/mapEmbed.ts';

const embedUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.0778077008304!2d80.41277907454942!3d8.295055791740014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2slk!4v1794028086994!5m2!1sen!2slk';

test('accepts a Google Maps embed URL', () => {
  const result = parseMapEmbedUrl(embedUrl);
  assert.equal(result.status, 'ready');
  assert.equal(result.value, embedUrl);
});

test('extracts src and decodes &amp; from a full iframe paste', () => {
  const snippet = `<iframe src="${embedUrl.replace(/&/g, '&amp;')}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
  const result = parseMapEmbedUrl(snippet);
  assert.equal(result.status, 'ready');
  assert.equal(result.value, embedUrl);
});

test('rejects a missing, non-Google, non-https, or non-embed value', () => {
  assert.equal(parseMapEmbedUrl('').status, 'missing');
  assert.equal(parseMapEmbedUrl(undefined).status, 'missing');
  assert.equal(
    parseMapEmbedUrl('https://maps.example.com/maps/embed?pb=!1m18').status,
    'missing',
  );
  assert.equal(
    parseMapEmbedUrl('http://www.google.com/maps/embed?pb=!1m18').status,
    'missing',
  );
  assert.equal(
    parseMapEmbedUrl('https://www.google.com/maps/place/Power+Engineering').status,
    'missing',
  );
});

test('builds an Open in Google Maps link from the embed coordinates', () => {
  assert.equal(
    googleMapsLinkForEmbed(embedUrl),
    'https://www.google.com/maps/search/?api=1&query=8.295055791740014,80.41277907454942',
  );
  assert.equal(googleMapsLinkForEmbed('https://www.google.com/maps/embed?pb=!1m18'), null);
});
