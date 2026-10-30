import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://*.supabase.co/**', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  );
});

test('Visual themes persist, auto follows routes, and calm mode stops ornamental motion', async ({
  page,
}, testInfo) => {
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'Eastern · Đông phương', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-visual-theme', 'eastern');
  await page.reload();
  await expect(
    page.getByRole('radio', { name: 'Eastern · Đông phương', exact: true }),
  ).toBeChecked();
  await page.getByRole('radio', { name: 'Tự động theo màn hình', exact: true }).check();
  await page.getByLabel('Không gian tĩnh', { exact: true }).check();
  await page.goto('/calendar');
  await expect(page.locator('html')).toHaveAttribute('data-visual-theme', 'eastern');
  await page.goto('/tarot');
  await expect(page.locator('html')).toHaveAttribute('data-visual-theme', 'western');
  expect(
    await page
      .locator('.astro-wheel-orbit')
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe('none');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-visual-theme', 'fusion');
  await page.getByRole('tab', { name: 'Tây phương', exact: true }).click();
  await expect(page.locator('.fortune-medallion .astro-zodiac-wheel')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Đông phương', exact: true }).click();
  await expect(page.locator('.fortune-medallion .astro-bagua-wheel')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Đông phương', exact: true }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Tây phương', exact: true })).toBeFocused();
  await page.getByRole('tab', { name: 'Tây phương', exact: true }).press('Home');
  await page.screenshot({ path: testInfo.outputPath('fusion-home.png'), fullPage: true });
});

test('Calendar day sheet supports keyboard close and event entry; profile shows real pillar counts', async ({
  page,
}, testInfo) => {
  await page.goto('/calendar');
  await page.locator('.calendar-day').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.day-sheet-facts')).toContainText('Thiên can hành');
  await page.screenshot({ path: testInfo.outputPath('calendar-sheet.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.locator('.calendar-day').nth(2).click();
  await page.getByRole('button', { name: 'Ghi sự kiện cho ngày này' }).click();
  await expect(page.getByRole('textbox', { name: 'Tên sự kiện' })).toBeFocused();
  await page.getByRole('textbox', { name: 'Tên sự kiện' }).fill('Một cuộc hẹn');
  await page.getByRole('button', { name: 'Lưu sự kiện', exact: true }).click();
  await page.reload();
  await page.locator('.calendar-day.has-event').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.event-item')).toContainText('Một cuộc hẹn');
  await page.goto('/profile');
  await page.getByLabel('Tên của bạn').fill('Minh');
  await page.getByLabel('Ngày sinh dương lịch').fill('1995-05-15');
  await page.getByLabel('Giờ sinh').fill('09:30');
  await page.getByRole('button', { name: 'Lưu hồ sơ', exact: true }).click();
  await expect(page.locator('.profile-western .astro-zodiac-wheel')).toHaveCount(1);
  await expect(page.locator('.profile-eastern')).toContainText('Hợi');
  const counts = await page.locator('.element-count strong').allTextContents();
  expect(counts.reduce((sum, n) => sum + Number(n), 0)).toBe(4);
  await expect(page.locator('.profile-western')).toContainText('Chưa phải natal chart');
  await page.screenshot({ path: testInfo.outputPath('fusion-profile.png'), fullPage: true });
});

test('Persona switches update welcome, prompt cards and local preference without enabling unauthenticated chat', async ({
  page,
}, testInfo) => {
  await page.goto('/chat');
  await page.getByRole('button', { name: /AI Tây phương Tarot/ }).click();
  await expect(page.locator('.chat-bubble')).toContainText('Tarot và vòng hoàng đạo');
  await page.getByRole('button', { name: 'Tôi muốn hiểu thông điệp Tarot.' }).click();
  await expect(page.getByLabel('Tin nhắn cho trợ lý')).toHaveValue(
    'Tôi muốn hiểu thông điệp Tarot.',
  );
  await expect(page.getByRole('button', { name: 'Gửi tin nhắn', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('button', { name: /AI Tây phương Tarot/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.screenshot({ path: testInfo.outputPath('western-chat.png'), fullPage: true });
  await page.getByRole('button', { name: /AI Đông phương Lịch/ }).click();
  await expect(page.locator('.chat-bubble')).toContainText('Can Chi');
});

test('All themes fit small screens and reduced motion disables every decorative animation', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const theme of ['Eastern · Đông phương', 'Western · Tây phương', 'Fusion · Đông & Tây']) {
    await page.goto('/settings');
    await page.getByRole('radio', { name: theme, exact: true }).check();
    for (const route of ['/', '/calendar', '/tarot', '/profile', '/chat']) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(
    await page
      .locator('.astro-wheel-orbit')
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe('none');
  await page.screenshot({ path: testInfo.outputPath('fusion-home-mobile.png'), fullPage: true });
  expect(errors).toEqual([]);
});
