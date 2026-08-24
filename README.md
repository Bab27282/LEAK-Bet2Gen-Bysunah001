# Bet2Gen.xyz — by Sunah

Plateforme de distribution de **codes de cartes cadeaux** (thème bleu + étoiles),
reconstruite de A à Z. Front + backend Node.js + base de données fichier (JSON).

> ⚠️ Les codes que tu charges dans l'admin doivent être des codes que tu **possèdes réellement**.
> Le site distribue des codes `XXXX-XXXX-XXXX`, jamais des identifiants de comptes.

## Démarrer

```bash
npm install
npm start
```

Puis ouvre **http://localhost:3000**

- **Connect with Discord** → te connecte en mode démo (utilisateur `/.User`).
- Le petit lien en dessous → connexion admin démo (`Sunah_>`) pour voir le **panneau admin**.

## Ce qui fonctionne

- Pages : **hub, services, ranking, history, admin** (tout en bleu).
- **Génération de code** avec cooldown (30 min par défaut) + limite journalière (50/jour).
- **Historique** perso avec bouton Copier.
- **Classement** (podium + top 50), alimenté automatiquement par les vrais membres.
- **Admin** : gérer les membres (ban/admin/cooldown), les services (nom, couleur, statut,
  ajout de codes en masse, vider le stock), **export CSV**, réglages Discord + limites.
- **EN / FR** partout.

## Brancher le vrai Discord (plus tard)

1. Copie `.env.example` en `.env`.
2. Crée une app sur https://discord.com/developers/applications
3. OAuth2 → mets `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` dans `.env`
4. Ajoute la redirection `http://localhost:3000/auth/discord/callback`
5. Redémarre. Le bouton "Connect with Discord" utilisera le vrai OAuth.

## Réinitialiser les données

```bash
npm run reset
```

Structure : `server.js` (serveur), `src/` (routes + store + seed), `public/` (front),
`data/db.json` (base de données créée au premier lancement).
