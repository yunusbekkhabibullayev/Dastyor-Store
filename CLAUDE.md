# Ravshan Rivoj Market — Claude Code uchun eslatmalar

To'liq loyiha hujjati `README.md`da. Bu fayl — kod bilan ishlaydigan AI
agentlar (Claude Code va h.k.) uchun, README'da yo'q, lekin kodni tushunish
uchun muhim bo'lgan nozik holatlar va qarorlar.

## ⚠️ Admin auth — faqat verifyInitData(), hech qachon xom ID emas (2026-08-22)

`server/services/telegramAuth.cjs: verifyInitData()` — Telegram WebApp
identifikatsiyasining **yagona ishonchli manbai**. `initDataUnsafe.user`
(frontend), `req.body.telegramId`, `X-Admin-Id` header — bularning HECH
BIRI imzolanmagan, client to'g'ridan-to'g'ri o'ylab topishi mumkin.

2026-08-22'da aynan shu narsaga (xom `X-Admin-Id`ga ishonish) tayangan
RBAC implementatsiyasi **to'liq parolsiz admin panel bypass**iga olib
keldi — production'da real `curl` bilan isbotlangan va tuzatilgan.
Kelajakda yangi admin/auth funksiya yozganda: faqat
`req.headers['x-telegram-init-data']`ni `verifyInitData()`dan o'tkazing,
natijasidagi `user.id`dan boshqa hech narsaga ishonmang.

## Telegram bot — webhook rejimi (2026-08-22'da to'liq ishga tushirilgan)

Bot **webhook** rejimida ishlaydi (`server/config/telegram.cjs` — `webhookUrl`
`WEBAPP_URL` mavjud bo'lsagina hisoblanadi, aks holda polling'ga tushadi).

- `server/services/TelegramService.cjs: init()` — bot instansiyasi yaratilib,
  webhook avtomatik `setWebHook()` bilan sozlanadi. **Buni qo'lda admin
  panelidan (`/api/admin/telegram/set-webhook`) qayta chaqirish shart emas.**
- `server/server.cjs` — `POST /telegram/webhook` route
  `telegramService.handleWebhookUpdate(req.body)` chaqiradi
  (`bot.processUpdate()`ning wrapper'i). **Bu route SPA fallbackdan OLDIN
  turishi shart** — aks holda Telegram update'lari `index.html`ga tushib,
  botga hech qachon yetib bormaydi (aynan shu bug bo'lgan, tuzatilgan).
- Agar kelajakda kimdir bu route'ni o'chirib qo'ysa yoki webhook rejimini
  polling'ga o'zgartirsa — `/start` va boshqa foydalanuvchi buyruqlari
  jimgina ishlamay qoladi (xatolik chiqmaydi, shuning uchun sezish qiyin).
  Tekshirish: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`.

## Admin xabarnomalari — faqat `.env` ADMIN_IDS

`TelegramService.notifyAdmins()` / `notifyAdminsThrottled()` va
`sendNotification()` (yangi buyurtma xabari) **faqat `.env`dagi `ADMIN_IDS`ga**
xabar yuboradi. Bazadagi `site_settings.admin_ids` **ataylab e'tiborga
olinmaydi** (foydalanuvchi so'rovi bilan olib tashlangan, 2026-08-22).

**Kelajakda buni qayta DB bilan merge qilmang** — bu ataylab qilingan
arxitektura qarori, bug emas.

`notifyAdmins()` quyidagi holatlarda avtomatik chaqiriladi:
- Server ishga tushganda (`server.cjs` — "✅ Sayt yangilandi")
- Express global error handler (har bir ushlanmagan route xatosi)
- `process.on('uncaughtException'/'unhandledRejection')`

Xato xabarlari **throttle** qilingan (`notifyAdminsThrottled`, 5 daqiqa
cooldown, key = xato matni) — takrorlanuvchi xato spam qilmaydi.

## Buyurtma raqamlari — sequential, server-authoritative (2026-08-22)

Buyurtma ID (`ORD-N`) **serverda** `orders_id_seq` (Postgres `SEQUENCE`)
orqali generatsiya qilinadi (`Order.getNextId()`,
`server/models/Order.cjs`). Client (frontend) ID o'ylab topmaydi va
yubormaydi — `checkout()` javobidagi `orderId`ni ishlatadi
(`src/context/StoreContext.jsx: placeOrder()`).

**Kelajakda buni o'zgartirmang:**
- Client-side random ID generatsiyasini (`Math.random()`) **qaytarmang** —
  eski kod shunday edi, kollizion xavfi bor edi, ataylab olib tashlangan.
- `checkout()`da client yuborgan `orderId`ga ishonmang — bu ataylab e'tiborga
  olinmaydi (spoofing/tartibsizlikning oldini olish uchun).
- `orders_id_seq` `database.cjs`ning `dbInit()`ida `CREATE SEQUENCE IF NOT
  EXISTS` bilan yaratiladi — yangi/toza DB'da 1'dan boshlanadi, mavjud DB'da
  hozirgi hisoblagichni saqlaydi. Buni qo'lda `setval()` bilan orqaga
  surmang — parallel checkout paytida kollizion yaratadi.
- `Order.getAll()`/`getByUserId()` endi `created_at` (faqat sana, vaqt yo'q)
  emas, raqamli `id` bo'yicha saralaydi — bu hozir chronological tartibning
  yagona ishonchli manbai.

Production'dagi 16 ta eski buyurtma (tasodifiy ID bilan yaratilgan)
`ORD-1`..`ORD-16`ga bir martalik qo'lda migratsiya bilan qayta raqamlangan
(2026-08-22). Tafsilot: `~/server-admin/.claude/artifacts/*/2026-08-22-20-39-dastyor-store-order-sequence.md`
(server ops, repo tashqarisida).

`orders.created_at` avval faqat sana edi (`new Date().toISOString().split('T')[0]`)
— hozir `Order.nowTashkent()` orqali to'liq `"YYYY-MM-DD HH:MM:SS"` (Asia/Tashkent
mahalliy vaqti) saqlanadi (checkout paytida). `getStats()`ning "bugungi"
so'rovlari shu sabab aniq tenglik (`= ?`) emas, `LIKE 'YYYY-MM-DD%'` bilan
ishlaydi — buni qaytarmang, aks holda statistika doim 0 chiqadi.

## Deploy

Bu server (Contabo, `194.163.188.28`) uchun deploy jarayoni **repo tashqarisida**
— `~/dastyor-store/` (ushbu `repo/`ning parent papkasi) da: `deploy.sh`,
`webhook-listener.js`. GitHub push webhook'i shu listener'ga keladi, u
`deploy.sh`ni chaqiradi (`git fetch && reset --hard origin/main` → docker
build → up → health-check). Bu qism repo'ning bir qismi emas, git orqali
kuzatilmaydi — server-tomon infratuzilma tafsilotlari uchun serverni
boshqaruvchi tomonga murojaat qiling.
