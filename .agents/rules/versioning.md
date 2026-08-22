# Loyihaning Standart Versiyalash Qoidasi (vN.N.MM)

## 📌 1. Versiya Formati

Loyihada har doim quyidagi qat'iy versiyalash standarti qo'llaniladi:

```
vN.N.MM
```

- **`N` (Major)**: 1 xonali son (`0` dan `9` gacha). Katta arxitektura bosqichlari (masalan: `2`).
- **`N` (Minor)**: 1 xonali son (`0` dan `9` gacha). Yangi yirik modullar / bo'limlar (masalan: `0`).
- **`MM` (Patch / Build)**: Qat'iy **2 xonali son** (`01` dan `99` gacha, boshida nol bilan: `01`, `02`, ..., `76`, `99`).

Misollar:
- `v2.0.76`
- `v2.1.05`
- `v1.0.01`

---

## 🔢 2. Git Commitlar Soniga Qarab Versiyani Hisoblash

Hozirgi bosqichda versiyaning patch (`MM`) qismi loyihadagi jami Git commitlar soniga bog'langan:

```bash
TOTAL_COMMITS=$(git rev-list --count HEAD)
MM=$(printf "%02d" $((TOTAL_COMMITS % 100)))
VERSION="v2.0.${MM}"
```

- Har bir yangi commit push qilinganda commitlar soni 1 taga oshadi va `MM` avtomatik yangilanadi.
- Versiyani yangilash skripti: `npm run version:sync` (yoki `node scripts/update-version.cjs`).

---

## 🛠️ 3. Versiya Fayllari va Integratsiya

1. **`server/config/version.cjs`**: Versiyani git orqali hisoblovchi backend moduli.
2. **`scripts/update-version.cjs`**: `src/version.json` va `package.json` fayllarini sinxronlovchi skript.
3. **`src/version.json`**: Frontend UI (`AdminLayout`, `AdminProfileModal`) to'g'ridan-to'g'ri foydalanadigan statik JSON.
4. **`GET /api/version`**: Tizim versiyasi, oxirgi commit hash va umumiy commitlar sonini qaytaruvchi ommaviy API.

---

## ⚠️ 4. AI Agentlar (Antigravity & Claude Code) uchun Majburiy Qoida

- Har qanday yangi funksiya yoki muhim tuzatish yakunlanib commit qilinishidan oldin:
  1. `node scripts/update-version.cjs` buyrug'ini ishga tushiring.
  2. `src/version.json` va `package.json` yangilanganligini tekshiring.
  3. Barcha o'zgarishlarni commit qiling.
