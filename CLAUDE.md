# Ravshan Rivoj Market — Claude Code uchun eslatmalar

To'liq loyiha hujjati `README.md`da. Bu fayl — kod bilan ishlaydigan AI
agentlar (Claude Code va h.k.) uchun, README'da yo'q, lekin kodni tushunish
uchun muhim bo'lgan nozik holatlar va qarorlar.

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

## Deploy

Bu server (Contabo, `194.163.188.28`) uchun deploy jarayoni **repo tashqarisida**
— `~/dastyor-store/` (ushbu `repo/`ning parent papkasi) da: `deploy.sh`,
`webhook-listener.js`. GitHub push webhook'i shu listener'ga keladi, u
`deploy.sh`ni chaqiradi (`git fetch && reset --hard origin/main` → docker
build → up → health-check). Bu qism repo'ning bir qismi emas, git orqali
kuzatilmaydi — server-tomon infratuzilma tafsilotlari uchun serverni
boshqaruvchi tomonga murojaat qiling.
