# Gringots - Aplicació Angular 20+

Aplicació web bàsica desenvolupada amb Angular 20+ i Tailwind CSS.

## 🛠️ Tecnologies

- **Angular 20+** amb Standalone Components
- **Tailwind CSS** per l'estilització
- **TypeScript** amb tipat fort

## 📦 Instal·lació

```bash
# Instal·lar dependències
npm install --legacy-peer-deps

# Executar en mode desenvolupament
npm start

# Compilar per producció
npm run build
```

## 🚀 Desenvolupament

L'aplicació està configurada amb:

- Mode fosc per defecte
- Layout responsive
- Components standalone

## 🔐 Configurar Login amb Google

1. Crea un OAuth 2.0 Client ID (tipus Web) al Google Cloud Console.
2. Afegeix els teus dominis a **Authorized JavaScript origins**.
3. Actualitza el fitxer `src/app/config/google-auth.config.ts` amb el teu Client ID.

Exemple:

```ts
export const GOOGLE_AUTH_CLIENT_ID =
  "1234567890-xxxxxx.apps.googleusercontent.com";
```

Quan el client ID està configurat, l'app protegeix les rutes i demana login a `/login`.

---

**Desenvolupada amb Angular 20 + Tailwind CSS**
