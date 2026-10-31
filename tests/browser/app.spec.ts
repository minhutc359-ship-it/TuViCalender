import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://*.supabase.co/**', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  );
});

test('Tarot library, 3-card reading, artwork modal, journal save and edit survive reload', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/tarot');
  await expect(page.getByRole('heading', { name: 'Không gian Tarot.' })).toBeVisible();
  await page.screenshot({ path: '/tmp/astroai-tarot-desktop.png', fullPage: true });
  await page.getByRole('tab', { name: 'Thư viện 78 lá' }).click();
  await expect(page.locator('.library-card')).toHaveCount(78);
  await page.getByRole('button', { name: 'Ẩn chính · 22' }).click();
  await expect(page.locator('.library-card')).toHaveCount(22);
  await page.getByRole('textbox', { name: 'Tìm lá bài' }).fill('The Fool');
  await expect(page.locator('.library-card')).toHaveCount(1);
  await page.locator('.library-card').click();
  await expect(page.getByRole('dialog', { name: 'Khởi đầu' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Trải bài' }).click();
  await page
    .getByRole('textbox', { name: '02 / ĐẶT MỘT Ý NIỆM' })
    .fill('Tôi nên chú ý điều gì hôm nay?');
  await page.getByRole('button', { name: 'Xào bài & bắt đầu' }).click();
  for (let i = 0; i < 3; i++) await page.locator('.deck-card:not(:disabled)').last().click();
  await page.getByRole('button', { name: 'Lật bài & khám phá' }).click();
  await expect(page.locator('.interpretation')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Những lá bài đã chọn bạn.' })).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Cảm nhận của bạn' })
    .fill('Một bước nhỏ, một góc nhìn mới.');
  await page.getByRole('button', { name: 'Lưu vào nhật ký' }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu');
  const journal = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('astroai.tarot-journal.v1')!),
  );
  expect(journal).toHaveLength(1);
  expect(new Set(journal[0].cards.map((c: { cardId: string }) => c.cardId)).size).toBe(3);
  await page.reload();
  await page.getByRole('tab', { name: 'Nhật ký', exact: true }).click();
  await expect(page.locator('.journal-entry')).toHaveCount(1);
  await page.locator('.journal-open').click();
  await page.getByRole('textbox', { name: 'Ghi chú của bạn' }).fill('Ghi chú sau khi nhìn lại.');
  await page.getByRole('button', { name: 'Lưu ghi chú', exact: true }).click();
  await expect(page.locator('.journal-entry')).toContainText('Ghi chú sau khi nhìn lại.');
  expect(errors).toEqual([]);
});

test('Daily card is stable across reload; career and Celtic Cross draw distinct cards', async ({
  page,
}) => {
  await page.goto('/tarot');
  await page.getByRole('button', { name: /Lá bài hôm nay/ }).click();
  await page.getByRole('button', { name: 'Rút lá hôm nay' }).click();
  await page.getByRole('button', { name: 'Lật bài & khám phá' }).click();
  await expect(page.locator('.interpretation')).toHaveCount(1);
  const src = await page.locator('.interpretation .card-front img').getAttribute('src');
  await page.reload();
  await page.getByRole('button', { name: /Lá bài hôm nay/ }).click();
  await page.getByRole('button', { name: 'Rút lá hôm nay' }).click();
  await page.getByRole('button', { name: 'Lật bài & khám phá' }).click();
  await expect(page.locator('.interpretation .card-front img')).toHaveAttribute('src', src!);
  for (const [name, count] of [
    ['Con đường sự nghiệp', 5],
    ['Celtic Cross', 10],
  ] as const) {
    await page.getByRole('button', { name: 'Một hành trình mới' }).click();
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await page.getByRole('button', { name: 'Xào bài & bắt đầu' }).click();
    for (let i = 0; i < count; i++) await page.locator('.deck-card:not(:disabled)').last().click();
    await page.getByRole('button', { name: 'Lật bài & khám phá' }).click();
    await expect(page.locator('.interpretation')).toHaveCount(count);
    const sources = await page
      .locator('.interpretation .card-front img')
      .evaluateAll((images) => images.map((img) => img.getAttribute('src')));
    expect(new Set(sources).size).toBe(count);
  }
});

test('Multiple profiles persist and daily scores stay stable; calendar events persist', async ({
  page,
}) => {
  await page.goto('/profile');
  await page.getByRole('textbox', { name: 'Tên của bạn' }).fill('Minh');
  await page.getByLabel('Ngày sinh dương lịch').fill('1995-05-15');
  await page.getByLabel('Giờ sinh').fill('09:30');
  await page.getByRole('checkbox', { name: /Tôi đồng ý lưu thông tin sinh/ }).check();
  await page.getByRole('button', { name: 'Lưu hồ sơ' }).click();
  await expect(page.getByRole('heading', { name: 'Kim Ngưu', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Thêm hồ sơ' }).click();
  await page.getByRole('textbox', { name: 'Tên của bạn' }).fill('An');
  await page.getByLabel('Ngày sinh dương lịch').fill('2000-10-29');
  await page.getByRole('checkbox', { name: /Tôi đồng ý lưu thông tin sinh/ }).check();
  await page.getByRole('button', { name: 'Lưu hồ sơ' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Bọ Cạp', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Minh', exact: true }).click();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Chào Minh/ })).toBeVisible();
  const scores = await page
    .locator('[role=meter]')
    .evaluateAll((m) => m.map((e) => e.getAttribute('aria-valuenow')));
  await page.reload();
  await expect(page.locator('[role=meter]')).toHaveCount(4);
  expect(
    await page
      .locator('[role=meter]')
      .evaluateAll((m) => m.map((e) => e.getAttribute('aria-valuenow'))),
  ).toEqual(scores);
  await page.goto('/calendar');
  await page.getByRole('button', { name: 'Mua xe', exact: true }).click();
  await page.getByRole('textbox', { name: 'Tên sự kiện' }).fill('Ngày đáng nhớ');
  await page.getByRole('button', { name: 'Lưu sự kiện' }).click();
  await page.reload();
  await expect(page.locator('.event-item')).toContainText('Ngày đáng nhớ');
});

test('Mobile pages fit 390px, image assets load, chat asks for login and reduced motion works', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const path of ['/', '/tarot', '/calendar', '/profile', '/chat']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.mobile-nav')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(
      await page
        .locator('img')
        .evaluateAll((images) =>
          (images as HTMLImageElement[])
            .filter((i) => i.loading !== 'lazy')
            .every((img) => img.complete && img.naturalWidth > 0),
        ),
    ).toBe(true);
    if (path === '/tarot')
      await page.screenshot({ path: '/tmp/astroai-tarot-mobile.png', fullPage: true });
    if (path === '/chat')
      await expect(page.getByRole('button', { name: 'Gửi tin nhắn', exact: true })).toBeDisabled();
  }
  expect(errors).toEqual([]);
});

test('Mobile can draw from the fan with animation enabled and Home opens the daily spread', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('link', { name: 'Lắng nghe thông điệp' }).click();
  await expect(page.getByRole('button', { name: /Lá bài hôm nay/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: /Dòng chảy thời gian/ }).click();
  await page.getByRole('button', { name: 'Xào bài & bắt đầu' }).click();
  for (let i = 0; i < 3; i++) await page.locator('.deck-card:not(:disabled)').last().click();
  await page.getByRole('button', { name: 'Lật bài & khám phá' }).click();
  await expect(page.locator('.interpretation')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: '/tmp/astroai-reading-mobile.png', fullPage: true });
});

test('Corrupt legacy records and blocked LocalStorage do not prevent IndexedDB saves', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('astroai.profiles.v1', '{"corrupt":true}');
    localStorage.setItem('astroai.tarot-journal.v1', '[null]');
    localStorage.setItem('astroai.calendar-events.v1', 'not-json');
    Storage.prototype.setItem = function () {
      throw new DOMException('blocked', 'SecurityError');
    };
  });
  await page.goto('/profile');
  await page.getByRole('textbox', { name: 'Tên của bạn' }).fill('Hồ sơ thử');
  await page.getByLabel('Ngày sinh dương lịch').fill('1995-05-15');
  await page.getByRole('checkbox', { name: /Tôi đồng ý lưu thông tin sinh/ }).check();
  await page.getByRole('button', { name: 'Lưu hồ sơ' }).click();
  await expect(page.getByRole('status')).toContainText('Đã cập nhật hồ sơ');
  await page.goto('/tarot');
  await expect(page.getByRole('heading', { name: 'Không gian Tarot.' })).toBeVisible();
  await page.getByRole('tab', { name: 'Nhật ký', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Mỗi hành trình đều bắt đầu từ một lá bài' }),
  ).toBeVisible();
  await page.goto('/calendar');
  await expect(page.locator('.calendar-day')).not.toHaveCount(0);
});

test('JoJo setting persists, library maps Star Platinum/Jotaro, and journal keeps orientation and original meaning', async ({
  page,
}) => {
  test.skip(
    process.env.VITE_ENABLE_REFERENCE_ART !== 'true',
    'Reference images require publisher rights verification and an opt-in build.',
  );
  const reading = {
    id: 'jojo-fixture',
    deckId: 'celestial-v1',
    spreadId: 'three',
    question: 'Một góc nhìn mới?',
    createdAt: '2026-10-29T04:00:00Z',
    profileId: 'guest',
    note: 'Ghi chú giữ nguyên',
    cards: [
      { cardId: 'major-17', reversed: true },
      { cardId: 'major-21', reversed: false },
      { cardId: 'major-00', reversed: false },
    ],
  };
  await page.addInitScript((value) => {
    if (!localStorage.getItem('astroai.tarot-journal.v1'))
      localStorage.setItem('astroai.tarot-journal.v1', JSON.stringify([value]));
  }, reading);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'JoJo ref', exact: true }).check();
  await expect(page.getByRole('status')).toContainText('Đang dùng JoJo ref');
  await page.reload();
  await expect(page.getByRole('radio', { name: 'JoJo ref', exact: true })).toBeChecked();
  await expect
    .poll(() =>
      page
        .locator('.appearance-preview img')
        .evaluateAll((images) =>
          (images as HTMLImageElement[]).every((i) => i.complete && i.naturalWidth > 0),
        ),
    )
    .toBe(true);
  await page.screenshot({ path: '/tmp/astroai-jojo-settings.png', fullPage: true });
  await page.getByRole('link', { name: 'Khám phá bộ bài', exact: true }).click();
  await page.getByRole('tab', { name: 'Thư viện 78 lá' }).click();
  await expect(page.locator('.library-card')).toHaveCount(78);
  await expect(page.locator('.library-card .jojo-artwork')).toHaveCount(78);
  await page.getByRole('textbox', { name: 'Tìm lá bài' }).fill('Jotaro');
  await expect(page.locator('.library-card')).toHaveCount(1);
  await page.locator('.library-card').click();
  await expect(page.locator('.jojo-inspect-reference')).toContainText('Star Platinum');
  await expect(page.locator('.jojo-inspect-reference')).toContainText('Jotaro Kujo');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Nhật ký', exact: true }).click();
  await page.locator('.journal-open').click();
  await expect(page.locator('.interpretation .jojo-artwork')).toHaveCount(3);
  await expect(page.locator('.interpretation .jojo-artwork').first()).toHaveClass(/reversed-art/);
  await expect(page.locator('.interpretation').first()).toContainText('Hy vọng đôi khi bắt đầu');
  await page.getByText('Luận giải này dựa trên điều gì?', { exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('không hiểu ngôn ngữ như một mô hình AI');
  await page.getByRole('button', { name: 'Đóng', exact: true }).click();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('astroai.tarot-journal.v1')!)),
  ).toEqual([reading]);
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'Celestial · Huyền Tinh', exact: true }).check();
  await page.goto('/tarot');
  await page.getByRole('tab', { name: 'Nhật ký', exact: true }).click();
  await page.locator('.journal-open').click();
  await expect(page.locator('.interpretation .jojo-artwork')).toHaveCount(0);
  await expect(page.locator('.interpretation .card-front img').first()).toHaveAttribute(
    'src',
    '/assets/tarot/celestial-v1/major/17.svg',
  );
  await expect(page.locator('.interpretation').first()).toContainText('Hy vọng đôi khi bắt đầu');
  expect(errors).toEqual([]);
});

test('Mobile JoJo setting and real flips show the corresponding Stands and preserve reversed cards', async ({
  page,
}) => {
  test.skip(
    process.env.VITE_ENABLE_REFERENCE_ART !== 'true',
    'Reference images require publisher rights verification and an opt-in build.',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(Crypto.prototype, 'getRandomValues', {
      value: (array: Uint32Array) => {
        array.fill(0);
        return array;
      },
    });
  });
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'JoJo ref', exact: true }).check();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Khám phá bộ bài', exact: true }).click();
  await page.getByRole('button', { name: 'Xào bài & bắt đầu' }).click();
  for (let i = 0; i < 3; i++) await page.locator('.deck-card:not(:disabled)').last().click();
  await page.getByRole('button', { name: 'Lật bài & khám phá' }).click();
  await expect(page.locator('.interpretation')).toHaveCount(3);
  await expect(page.locator('.interpretation .jojo-artwork')).toHaveCount(3);
  await expect(page.locator('.interpretation .jojo-artwork.reversed-art')).toHaveCount(3);
  const names = await page.locator('.jojo-reference-caption').allTextContents();
  expect(names).toEqual([
    'Hanged Man · J. Geil',
    'Death Thirteen · Mannish Boy',
    'Yellow Temperance · Rubber Soul',
  ]);
  await expect
    .poll(() =>
      page
        .locator('.interpretation img')
        .evaluateAll((images) =>
          (images as HTMLImageElement[]).every((i) => i.complete && i.naturalWidth > 0),
        ),
    )
    .toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '/tmp/astroai-jojo-reading-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Lưu vào nhật ký' }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('astroai.tarot-journal.v1')!),
  );
  expect(saved[0].cards.map((c: { cardId: string }) => c.cardId)).toEqual([
    'major-12',
    'major-13',
    'major-14',
  ]);
  expect(saved[0].cards.every((c: { reversed: boolean }) => c.reversed)).toBe(true);
});
