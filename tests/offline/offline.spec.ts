import { test, expect } from '@playwright/test';

test('Complete download enables cold offline reload, all 78 JoJo images, detailed readings and journal persistence', async ({
  page,
  context,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'JoJo ref', exact: true }).check();
  await page.getByRole('button', { name: 'Tải bộ dữ liệu offline' }).click();
  await expect(page.locator('.offline-settings [role=status]')).toContainText(
    'Đã sẵn sàng dùng offline',
    { timeout: 60000 },
  );
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const cacheURLs = await page.evaluate(async () => {
    const names = await caches.keys();
    const lists = await Promise.all(
      names
        .filter((n) => n.startsWith('astroai-offline-'))
        .map(async (n) => (await (await caches.open(n)).keys()).map((r) => r.url)),
    );
    return lists.flat();
  });
  expect(cacheURLs.some((url) => url.includes('supabase.co') || url.includes('api.openai'))).toBe(
    false,
  );
  await context.setOffline(true);
  await page.goto('/tarot');
  await expect(page.getByRole('heading', { name: 'Không gian Tarot.' })).toBeVisible();
  await page.getByRole('tab', { name: 'Thư viện 78 lá' }).click();
  await expect(page.locator('.library-card .jojo-artwork')).toHaveCount(78);
  await page.getByRole('button', { name: 'Gậy', exact: true }).click();
  await expect(page.locator('.library-card')).toHaveCount(14);
  await page.screenshot({ path: testInfo.outputPath('jojo-minor-library.png'), fullPage: true });
  await page.locator('.library-card').first().click();
  await expect(page.locator('.jojo-inspect-reference')).toContainText('Red Hot Chili Pepper');
  await expect(page.getByRole('dialog')).toContainText('Liên tưởng mỹ thuật');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Trải bài' }).click();
  await page
    .getByRole('textbox', { name: '02 / ĐẶT MỘT Ý NIỆM' })
    .fill('Tôi cần nhìn lại công việc như thế nào?');
  await page.getByLabel('Chủ đề luận giải offline').selectOption('career');
  await page.getByRole('button', { name: 'Xào bài & bắt đầu' }).click();
  for (let i = 0; i < 3; i++) await page.locator('.deck-card:not(:disabled)').last().click();
  await page.getByRole('button', { name: 'Lật bài & khám phá' }).click();
  await expect(page.locator('.interpretation')).toHaveCount(3);
  await expect(page.locator('.card-practice')).toHaveCount(3);
  await expect(page.locator('.reading-result')).toHaveAttribute(
    'data-interpretation-version',
    'rws-vi-2',
  );
  await expect(page.locator('.reading-connections article')).toHaveCount(2);
  await expect(page.locator('.reading-topic-badge')).toContainText('Công việc');
  await page.screenshot({ path: testInfo.outputPath('offline-reading.png'), fullPage: true });
  await expect
    .poll(() =>
      page
        .locator('.interpretation img')
        .evaluateAll((images) =>
          (images as HTMLImageElement[]).every((i) => i.complete && i.naturalWidth > 0),
        ),
    )
    .toBe(true);
  await page.getByRole('textbox', { name: 'Cảm nhận của bạn' }).fill('Đọc đầy đủ khi đã tắt mạng.');
  await page.getByRole('button', { name: 'Lưu vào nhật ký' }).click();
  const before = await page.locator('.reading-result').innerText();
  await page.reload();
  await page.getByRole('tab', { name: 'Nhật ký', exact: true }).click();
  await page.locator('.journal-open').click();
  expect(await page.locator('.reading-result').innerText()).toBe(before);
  await page.getByRole('button', { name: 'Đóng', exact: true }).click();
  await page.goto('/settings');
  await expect(page.locator('.offline-settings [role=status]')).toContainText(
    'Đã sẵn sàng dùng offline',
  );
  await page.screenshot({ path: testInfo.outputPath('offline-settings.png'), fullPage: true });
  await page.getByRole('radio', { name: 'Celestial · Huyền Tinh', exact: true }).check();
  await page.getByRole('radio', { name: 'Western · Tây phương', exact: true }).check();
  await page.getByLabel('Không gian tĩnh', { exact: true }).check();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-visual-theme', 'western');
  await expect(page.locator('.fortune-medallion .astro-zodiac-wheel')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'calm');
  await page.goto('/tarot');
  await page.getByRole('tab', { name: 'Thư viện 78 lá' }).click();
  await expect(page.locator('.library-card')).toHaveCount(78);
  await page.goto('/calendar');
  await expect(page.locator('.calendar-day')).not.toHaveCount(0);
  await page.goto('/profile');
  await expect(page.getByRole('textbox', { name: 'Tên của bạn' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Failed or corrupt assets never report offline-ready; retry completes the verified bundle', async ({
  page,
  context,
}) => {
  await context.route('**/assets/tarot/jojo-ref/minor/cups-07.png', (route) =>
    route.fulfill({ status: 503, body: 'temporarily unavailable' }),
  );
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Tải bộ dữ liệu offline' }).click();
  await expect(page.locator('.offline-settings [role=alert]')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('.offline-settings [role=status]')).not.toContainText('Đã sẵn sàng');
  await context.unroute('**/assets/tarot/jojo-ref/minor/cups-07.png');
  await context.route('**/assets/tarot/jojo-ref/minor/cups-07.png', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: 'corrupt image bytes' }),
  );
  await page.getByRole('button', { name: 'Tải bộ dữ liệu offline' }).click();
  await expect(page.locator('.offline-settings [role=alert]')).toContainText('chưa khớp phiên bản');
  await expect(page.locator('.offline-settings [role=status]')).not.toContainText('Đã sẵn sàng');
  await context.unroute('**/assets/tarot/jojo-ref/minor/cups-07.png');
  await page.getByRole('button', { name: 'Tải bộ dữ liệu offline' }).click();
  await expect(page.locator('.offline-settings [role=status]')).toContainText(
    'Đã sẵn sàng dùng offline',
    { timeout: 60000 },
  );
});

test('Interrupted shell installation reports a recoverable error instead of leaving download pending', async ({
  page,
  context,
}) => {
  await context.route('**/assets/CalendarPage-*.js', (route) =>
    route.fulfill({ status: 503, body: 'installation interrupted' }),
  );
  await page.goto('/settings');
  await expect(page.locator('.offline-settings [role=alert]')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Tải bộ dữ liệu offline' })).toBeEnabled();
  await expect(page.locator('.offline-settings [role=status]')).not.toContainText('Đã sẵn sàng');
  await context.unroute('**/assets/CalendarPage-*.js');
  await page.getByRole('button', { name: 'Tải bộ dữ liệu offline' }).click();
  await expect(page.locator('.offline-settings [role=status]')).toContainText(
    'Đã sẵn sàng dùng offline',
    { timeout: 60000 },
  );
});
