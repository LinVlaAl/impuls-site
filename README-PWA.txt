# ИМПУЛЬС — PWA-комплект

## Что куда положить (в корень репозитория impuls-site)

```
impuls-site/
├── index.html           ← ваш существующий файл (внести правки, см. ниже)
├── manifest.json        ← из этого комплекта
├── sw.js                ← из этого комплекта (ЗАМЕНИТЬ старый)
├── visitor-counter.js   ← из этого комплекта
├── icon-192.png
├── icon-512.png
└── brochures/
```

## Правки в index.html

### В <head> добавить:

```html
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="theme-color" content="#0a3d6b">
```

### Перед </body> добавить:

```html
<script src="visitor-counter.js"></script>
<script>
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
</script>
```

## Настройка счётчика

1. Откройте сайт, разблокируйте панель админа своим паролем.
2. F12 -> Application -> Local Storage -> ваш домен.
3. Найдите ключ, появившийся после ввода пароля (обычно вида adminUnlocked
   или имя на русском). Впишите его в массив ADMIN_KEYS в visitor-counter.js.
4. Если счётчик когда-то уже начинал считать под другим именем — замените
   NAMESPACE на новое уникальное имя, например 'impul-site-2026'.

## Важно

- Каждое обновление сайта: менять CACHE = 'impul-v1' на 'impul-v2' в sw.js,
  иначе посетители увидят старую версию из кэша.
- Пароль панели админа смените со значения по умолчанию.
- Счётчик CountAPI — публичный сервис без гарантий; для надёжной статистики
  рассмотрите Яндекс.Метрику (она же не требует пароля и не показывается
  посетителям).
