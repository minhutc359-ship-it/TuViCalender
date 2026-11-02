import { test, expect } from '@playwright/test';
test('Google login offers the free AI quota and sends OAuth through Supabase', async ({ page }) => {
  await page.route('https://astroai-test.supabase.co/auth/v1/authorize**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Google OAuth test</h1>' }),
  );
  await page.goto('/chat');
  await expect(page.getByText('20 lượt AI mỗi ngày')).toBeVisible();
  await page.getByRole('button', { name: 'Tiếp tục bằng Google' }).click();
  await expect(page).toHaveURL(/astroai-test\.supabase\.co\/auth\/v1\/authorize/);
  expect(new URL(page.url()).searchParams.get('provider')).toBe('google');
});

test('chat answers without authentication, labels sources, keeps history and opens a bookmarked reference', async ({
  page,
}) => {
  await page.goto('/chat');
  await page.getByLabel('Tin nhắn cho trợ lý').fill('The Star ngược là gì?');
  await page.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click();
  await expect(page.locator('.chat-source')).toHaveText('Trả lời từ thư viện');
  await expect(page.locator('.chat-bubble').last()).toContainText('Hy vọng');
  await page.reload();
  await expect(page.locator('.chat-source')).toHaveText('Trả lời từ thư viện');
  await page.getByRole('link', { name: 'Xem The Star · ngược', exact: true }).click();
  await expect(page.locator('.knowledge-entry')).toHaveCount(1);
  await page.getByRole('button', { name: 'Lưu nội dung', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bỏ lưu', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
test('backup JSON has a preview and only imports on confirmation without replacing current settings', async ({
  page,
}) => {
  await page.goto('/settings');
  const data = {
    app: 'AstroAI',
    schemaVersion: 1,
    createdAt: '2026-10-31T00:00:00Z',
    data: {
      'astroai.profiles.v1': [
        {
          id: 'import-me',
          name: 'Backup test',
          birthDate: '2000-01-01',
          birthTime: '',
          birthPlace: '',
        },
      ],
      'astroai.visual-theme.v1': 'western',
    },
  };
  await page.getByLabel('Chọn bản sao để nhập').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await expect(page.locator('.backup-preview')).toContainText('Hồ sơ: thêm 1');
  expect(await page.evaluate(() => localStorage.getItem('astroai.profiles.v1'))).toBeNull();
  await page.getByRole('button', { name: 'Xác nhận gộp dữ liệu', exact: true }).click();
  await expect(page.locator('.backup-settings [role=status]')).toContainText('Đã gộp dữ liệu');
  await page.goto('/profile');
  await expect(page.getByLabel('Tên của bạn')).toHaveValue('Backup test');
});

test('calendar horizontal swipe changes month without clicking a stale day; all primary routes fit 320–1280px', async ({
  page,
}) => {
  await page.goto('/calendar');
  const grid = page.locator('.calendar-grid');
  await grid.scrollIntoViewIfNeeded();
  const box = await grid.boundingBox();
  expect(box).toBeTruthy();
  const heading = page.locator('.calendar-panel h2');
  const before = await heading.innerText();
  await page.mouse.move(box!.x + box!.width * 0.8, box!.y + 90);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + 90, { steps: 8 });
  await page.mouse.up();
  await expect(heading).not.toHaveText(before);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  for (const width of [320, 375, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/',
      '/calendar',
      '/tarot',
      '/chat',
      '/profile',
      '/knowledge',
      '/settings',
    ]) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} at ${width}px: ${JSON.stringify(
          await page.evaluate(() =>
            [...document.querySelectorAll('main *')]
              .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
              .slice(0, 8)
              .map((e) => ({ css: e.className, width: e.getBoundingClientRect().width })),
          ),
        )}`,
      ).toBe(true);
    }
  }
});
