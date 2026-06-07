# MemWal Mainnet Setup — Mr. Toxic Special One

**Dashboard:** [https://memory.walrus.xyz/dashboard](https://memory.walrus.xyz/dashboard)  
**Relayer (mainnet):** `https://relayer.memory.walrus.xyz`

---

## Tóm tắt (VI)

| Vai trò | Việc cần làm |
|---------|----------------|
| **Operator (deploy app)** | Kết nối ví Sui trên dashboard → tạo **MemWalAccount** → tạo **delegate key** → dán vào `.env` server |
| **User (fan dùng app)** | Chỉ **Connect wallet** trong app + ký message — memory lưu namespace `special-one-{address}` trên account operator |

**Quan trọng:** Dùng **delegate key**, không dùng owner key (ADR-002). Mỗi MemWalAccount có tối đa **20 delegate keys**, revoke được trên dashboard.

---

## Bước 1 — Operator: Tạo MemWalAccount mainnet

1. Mở [memory.walrus.xyz/dashboard](https://memory.walrus.xyz/dashboard)
2. Chọn **Connect wallet** (ví Sui mainnet — cùng network với `NEXT_PUBLIC_SUI_NETWORK=mainnet`)
3. Lần đầu: dashboard tạo **MemWalAccount** on-chain (object Sui gắn ví bạn)
4. Copy **Account ID** (object ID) → đây là `MEMWAL_ACCOUNT_ID`

Explorer (submission):

```
https://suiscan.xyz/mainnet/object/{MEMWAL_ACCOUNT_ID}
```

---

## Bước 2 — Operator: Tạo delegate key

1. Trên dashboard, mục **Delegate keys** (hoặc Permissions / Agents)
2. **Create delegate key** — đặt tên ví dụ `toxic-special-one-prod`
3. Copy **private key hex** ngay (chỉ hiện một lần) → `MEMWAL_PRIVATE_KEY`
4. **Không** commit key vào git; chỉ set trên Vercel / `.env.local`

Revoke: dashboard → xóa delegate → key cũ không còn ghi được.

---

## Bước 3 — Cấu hình `.env`

```bash
# Delegate ONLY — from dashboard, not owner key
MEMWAL_PRIVATE_KEY=0x...
MEMWAL_ACCOUNT_ID=0x...

# Mainnet relayer (default)
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz

# Optional: hiện link explorer trong UI press room
NEXT_PUBLIC_MEMWAL_ACCOUNT_ID=0x...

NEXT_PUBLIC_SUI_NETWORK=mainnet
```

**Không set** `MEMWAL_NAMESPACE` global cho app này — runtime dùng `special-one-{wallet}` per user.

---

## Bước 4 — User flow trong app

1. User mở app → **Connect wallet** (dapp-kit)
2. Ký `PersonalMessage` → `/api/auth/verify`
3. Chat → predictions/roasts ghi vào namespace:

```
special-one-{walletAddress.toLowerCase()}
```

User **không** cần tạo MemWalAccount riêng trừ khi bạn build BYOK MemWal (ngoài scope MVP).

---

## Bước 5 — Verify live

```bash
# Standalone repo
npm run memwal:verify

# Monorepo
pnpm --filter @memwalpp/toxic-special-one memwal:verify
```

Hoặc chạy app → header **MemWal 🟢 LIVE**.

Smoke test (monorepo):

```bash
pnpm memwal:restore-smoke
```

---

## Submit hackathon (Walrus Sessions 4)

| Item | Action |
|------|--------|
| MemWalAccount explorer | Link `suiscan.xyz/mainnet/object/{MEMWAL_ACCOUNT_ID}` |
| Walrus usage blurb | Mỗi ví = namespace; recall + remember qua MemWal relayer |
| Memory Moment | Cùng user wallet, Day 1 vs Day 4+ |

---

## English summary

1. **Operator:** Connect wallet at [memory.walrus.xyz/dashboard](https://memory.walrus.xyz/dashboard) → create MemWalAccount → create **delegate** key → env vars on server.
2. **Users:** Connect Sui wallet in the app only; memories isolated by `special-one-{address}` namespace on your account.
3. Never use owner keys in the app — delegate keys only, revocable from the dashboard.

## Links

| Resource | URL |
|----------|-----|
| Dashboard | https://memory.walrus.xyz/dashboard |
| MemWal docs | https://docs.memwal.ai |
| Walrus Memory 101 | https://docs.wal.app |
| Workshop map | `memwal-agent-memory/docs/judge-walrus-memory-workshop.md` |
