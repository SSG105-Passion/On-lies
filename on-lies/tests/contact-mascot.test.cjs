const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('top bar has fourth button "Liên hệ" and mascot GUI markup', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  // Verify the 4 buttons in .home-nav
  assert.ok(html.includes('id="homeLobbyBtn"'), 'Must have home lobby button');
  assert.ok(html.includes('data-home-dialog="homeSafetyDialog"'), 'Must have safety dialog button');
  assert.ok(html.includes('id="toggleLeaderboardBtn"'), 'Must have leaderboard button');
  assert.ok(html.includes('id="toggleContactBtn"'), 'Must have toggleContactBtn');
  assert.ok(html.includes('Liên hệ'), 'Must have text "Liên hệ"');

  // Match home-nav section
  const homeNavMatch = html.match(/<nav class="home-nav"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(homeNavMatch, '<nav class="home-nav"> must exist');
  const navContent = homeNavMatch[1];
  const buttonMatches = navContent.match(/<button/g);
  assert.equal(buttonMatches?.length, 4, 'home-nav must have exactly 4 buttons');

  // Verify Mascot & Contact GUI widget
  assert.ok(html.includes('id="contactMascotWidget"'), 'Must have #contactMascotWidget');
  assert.ok(html.includes('id="closeContactBtn"'), 'Must have #closeContactBtn');
  assert.ok(html.includes('id="mascotInteractiveTrigger"'), 'Must have #mascotInteractiveTrigger');
  assert.ok(html.includes('mascot-svg-box'), 'Must have mascot-svg-box');
  assert.ok(html.includes('1900 6868'), 'Must have mock hotline');
  assert.ok(html.includes('hotro@on-lies.edu.vn') || html.includes('onliesbypassion@gmail.com'), 'Must have contact email');
  assert.ok(html.includes('quickContactForm'), 'Must have quickContactForm');
});

test('audio.ts exports mascot sound functions', () => {
  const audioTs = fs.readFileSync(path.join(__dirname, '..', 'src', 'audio.ts'), 'utf8');
  assert.ok(audioTs.includes('playMascotSlideInSound'), 'Must export playMascotSlideInSound');
  assert.ok(audioTs.includes('playMascotSlideOutSound'), 'Must export playMascotSlideOutSound');
  assert.ok(audioTs.includes('playMascotInteractionSound'), 'Must export playMascotInteractionSound');
});

test('overview.css includes mascot slide and wobble animations', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'overview.css'), 'utf8');
  assert.ok(css.includes('.contact-mascot-widget'), 'Must style .contact-mascot-widget');
  assert.ok(css.includes('@keyframes mascotFloat'), 'Must include mascotFloat animation');
  assert.ok(css.includes('@keyframes mascotWobble'), 'Must include mascotWobble animation');
  assert.ok(css.includes('.contact-mascot-widget.is-open'), 'Must handle .is-open transition');
});
