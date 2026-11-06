# Сайт «ИМПУЛЬС» — публикация на GitHub Pages

Состав репозитория:
- `index.html` — сам сайт (~0,8 МБ: вся вёрстка, картинки и скрипты внутри)
- `brochures/` — 25 PDF-буклетов моделей, скачиваются с сайта кнопкой
- `.nojekyll` — служебный флаг, отключает обработку Jekyll на GitHub Pages (не удалять)
- `README.md` — эта инструкция

## Публикация через браузер (git не нужен)

1. Зарегистрируйтесь на github.com (если аккаунта нет).
2. Нажмите «+» (справа сверху) → **New repository**.
   - Repository name: `impuls-site` (или любое другое)
   - Видимость: **Public** (для бесплатного Pages обязателен)
   - «Add a README file» — можно не ставить. Кнопка **Create repository**.
3. На открывшейся странице: **uploading an existing file** → перетащите
   `index.html` и ПАПКУ `brochures` целиком → **Commit changes**.
   Файлы меньше 25 МБ каждый — браузер их примет.
4. Добавьте `.nojekyll`: кнопка **Add file → Create new file**, в имени файла
   наберите `.nojekyll`, содержимое оставьте пустым → **Commit changes**.
5. Вкладка **Settings → Pages** (слева, «Code and automation»):
   - Build and deployment → Source: **Deploy from a branch**
   - Branch: **main**, папка **/ (root)** → **Save**
6. Подождите 1–2 минуты. Сайт: `https://ВАШ_ЛОГИН.github.io/impuls-site/`

## Обновление сайта

Вкладка **Code** → **Add file → Upload files** → перетащите новый `index.html`
(и, если менялись, буклеты) → **Commit changes**. Через минуту сайт обновится.

## Свой домен (необязательно)

1. Settings → Pages → **Custom domain** → впишите домен → Save.
2. У регистратора: DNS-запись `CNAME` (поддомен → `ВАШ_ЛОГИН.github.io`).
3. После проверки включите **Enforce HTTPS**.
4. Появившийся в репозитории файл `CNAME` не удаляйте — иначе домен слетит.

## Важные ограничения GitHub Pages

- Публичный репозиторий = публичный сайт.
- Лимит на один файл — 100 МБ (у нас всё гораздо меньше), загрузка через браузер — 25 МБ на файл.
- Рекомендуемый лимит сайта — 1 ГБ.
- HTTPS на `*.github.io` включается автоматически.

## Если удобнее через git

```
git init
git add .
git commit -m "ИМПульс: публикация"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/impuls-site.git
git push -u origin main
```
