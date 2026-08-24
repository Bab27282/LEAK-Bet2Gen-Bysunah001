// LeakBySunah
window.I18N = {
  en: {
    connectDiscord: 'Connect with Discord',
    demoAdmin: 'Demo: enter as admin (Sunah)',
    users: 'users', services: 'services', generated: 'generated',

    hub: 'hub', nav_services: 'services', ranking: 'ranking', history: 'history', admin: 'admin',

    yourDay: 'Your day', todayCount: '{used} / {limit} today',
    yourCooldown: 'Your cooldown: {v}',
    generateNow: 'Generate now  →',
    last7days: 'last 7 days',
    fasterTitle: 'Want a faster cooldown?',
    fasterDesc: 'Invite friends or boost on Discord — roles update automatically (down to 30s).',
    openDiscord: 'Open Discord  →',

    dailyGenerations: 'Daily generations',
    generate: 'Generate',
    outOfStock: 'Out of stock',
    awaitingRestock: 'Awaiting restock',
    disabled: 'Unavailable',
    codesLeft: '{n} codes left',

    privacy: 'Privacy', terms: 'Terms', discord: 'Discord',

    copy: 'Copy', copied: 'Copied',

    historyEmpty: 'No codes generated yet.',
    rankingEmpty: 'No ranking yet.',

    codeReady: 'Your code is ready',
    codeReadySub: 'Here is your {svc} code. Keep it safe — it is one-time.',
    copyCode: 'Copy code', close: 'Close',

    t_generated: 'Code generated!',
    t_copied: 'Copied to clipboard',
    t_cooldown: 'Please wait {v} before generating again',
    t_dailyLimit: 'Daily limit reached ({limit}/day)',
    t_banned: 'Your account is banned',
    t_outOfStock: 'This service is out of stock',
    t_restock: 'This service is awaiting restock',
    t_error: 'Something went wrong',
    t_discordNotConfigured: 'Discord login is not configured — using demo login',
    t_saved: 'Saved',
    t_added: '{n} codes added',
    t_cleared: 'Stock cleared',

    logout: 'Log out',

    // LeakBySunah
    adminPanel: 'Admin Panel',
    manageDesc: 'Manage users, services and stock',
    tab_users: 'Users', tab_services: 'Services', tab_export: 'Export', tab_discord: 'Discord',
    searchUsers: 'Search by username or ID...',
    allUsers: 'All users', a_active: 'Active', a_banned: 'Banned',
    th_user: 'User', th_id: 'ID', th_gens: 'Gens', th_cooldown: 'Cooldown', th_status: 'Status', th_actions: 'Actions',
    ban: 'Ban', unban: 'Unban', mkAdmin: 'Make admin', rmAdmin: 'Remove admin', del: 'Delete',
    noUsers: 'No users found.',
    a_admin: 'Admin', a_default: 'default',

    addService: '+ Add service',
    f_name: 'Name', f_color: 'Color', f_status: 'Status',
    f_logo: 'Logo image URL', f_logo_h: 'Paste a logo/banner image URL to match the real brand (leave empty to use the default).',
    st_active: 'Active', st_restock: 'Awaiting restock', st_disabled: 'Disabled',
    save: 'Save', pasteCodes: 'Paste codes (one per line)…',
    addCodes: 'Add codes', clearStock: 'Clear stock', deleteService: 'Delete service',
    stockLabel: '{n} codes in stock', genLabel: '{n} generated',

    exportTitle: 'Export your data as CSV',
    exp_users: 'Users', exp_users_d: 'All accounts, roles and gens',
    exp_gens: 'Generations', exp_gens_d: 'Every claimed code with date',
    exp_stock: 'Stock', exp_stock_d: 'Codes left per service',
    download: 'Download CSV',

    d_invite: 'Discord invite link', d_invite_h: 'Shown on the "faster cooldown" cards.',
    d_webhook: 'Webhook URL (optional)', d_webhook_h: 'For future restock / generation notifications.',
    d_oauth: 'Discord OAuth', d_configured: 'Configured ✓', d_notconfigured: 'Not configured (demo login active)',
    d_oauth_h: 'Set DISCORD_CLIENT_ID / SECRET in your .env file to enable real Discord login.',

    settings: 'Settings', s_dailyLimit: 'Daily limit', s_cooldown: 'Default cooldown (seconds)',
    s_baseUsers: 'Base users (display)', s_baseGen: 'Base generated (display)',
  },

  fr: {
    connectDiscord: 'Se connecter avec Discord',
    demoAdmin: 'Démo : entrer en admin (Sunah)',
    users: 'membres', services: 'services', generated: 'générés',

    hub: 'accueil', nav_services: 'services', ranking: 'classement', history: 'historique', admin: 'admin',

    yourDay: 'Ta journée', todayCount: '{used} / {limit} aujourd’hui',
    yourCooldown: 'Ton cooldown : {v}',
    generateNow: 'Générer maintenant  →',
    last7days: '7 derniers jours',
    fasterTitle: 'Un cooldown plus rapide ?',
    fasterDesc: 'Invite des amis ou boost sur Discord — les rôles se mettent à jour automatiquement (jusqu’à 30s).',
    openDiscord: 'Ouvrir Discord  →',

    dailyGenerations: 'Générations du jour',
    generate: 'Générer',
    outOfStock: 'Rupture de stock',
    awaitingRestock: 'En attente de restock',
    disabled: 'Indisponible',
    codesLeft: '{n} codes restants',

    privacy: 'Confidentialité', terms: 'Conditions', discord: 'Discord',

    copy: 'Copier', copied: 'Copié',

    historyEmpty: 'Aucun code généré pour l’instant.',
    rankingEmpty: 'Pas encore de classement.',

    codeReady: 'Ton code est prêt',
    codeReadySub: 'Voici ton code {svc}. Garde-le précieusement — il est à usage unique.',
    copyCode: 'Copier le code', close: 'Fermer',

    t_generated: 'Code généré !',
    t_copied: 'Copié dans le presse-papiers',
    t_cooldown: 'Patiente {v} avant de regénérer',
    t_dailyLimit: 'Limite journalière atteinte ({limit}/jour)',
    t_banned: 'Ton compte est banni',
    t_outOfStock: 'Ce service est en rupture de stock',
    t_restock: 'Ce service est en attente de restock',
    t_error: 'Une erreur est survenue',
    t_discordNotConfigured: 'Connexion Discord non configurée — mode démo',
    t_saved: 'Enregistré',
    t_added: '{n} codes ajoutés',
    t_cleared: 'Stock vidé',

    logout: 'Se déconnecter',

    adminPanel: 'Panneau Admin',
    manageDesc: 'Gérer les membres, services et stock',
    tab_users: 'Membres', tab_services: 'Services', tab_export: 'Export', tab_discord: 'Discord',
    searchUsers: 'Rechercher par pseudo ou ID...',
    allUsers: 'Tous', a_active: 'Actifs', a_banned: 'Bannis',
    th_user: 'Membre', th_id: 'ID', th_gens: 'Gens', th_cooldown: 'Cooldown', th_status: 'Statut', th_actions: 'Actions',
    ban: 'Bannir', unban: 'Débannir', mkAdmin: 'Passer admin', rmAdmin: 'Retirer admin', del: 'Supprimer',
    noUsers: 'Aucun membre trouvé.',
    a_admin: 'Admin', a_default: 'défaut',

    addService: '+ Ajouter un service',
    f_name: 'Nom', f_color: 'Couleur', f_status: 'Statut',
    f_logo: 'URL de l’image du logo', f_logo_h: 'Colle l’URL d’un logo/bannière pour coller à la vraie marque (laisse vide pour le rendu par défaut).',
    st_active: 'Actif', st_restock: 'En attente de restock', st_disabled: 'Désactivé',
    save: 'Enregistrer', pasteCodes: 'Colle les codes (un par ligne)…',
    addCodes: 'Ajouter les codes', clearStock: 'Vider le stock', deleteService: 'Supprimer le service',
    stockLabel: '{n} codes en stock', genLabel: '{n} générés',

    exportTitle: 'Exporte tes données en CSV',
    exp_users: 'Membres', exp_users_d: 'Comptes, rôles et gens',
    exp_gens: 'Générations', exp_gens_d: 'Chaque code réclamé avec la date',
    exp_stock: 'Stock', exp_stock_d: 'Codes restants par service',
    download: 'Télécharger le CSV',

    d_invite: 'Lien d’invitation Discord', d_invite_h: 'Affiché sur les cartes “cooldown plus rapide”.',
    d_webhook: 'URL Webhook (optionnel)', d_webhook_h: 'Pour de futures notifs restock / génération.',
    d_oauth: 'Discord OAuth', d_configured: 'Configuré ✓', d_notconfigured: 'Non configuré (login démo actif)',
    d_oauth_h: 'Renseigne DISCORD_CLIENT_ID / SECRET dans ton fichier .env pour activer le vrai login Discord.',

    settings: 'Réglages', s_dailyLimit: 'Limite journalière', s_cooldown: 'Cooldown par défaut (secondes)',
    s_baseUsers: 'Membres de base (affichage)', s_baseGen: 'Générés de base (affichage)',
  },
};

window.LANG = localStorage.getItem('lang') || 'en';
window.setLang = function (l) {
  window.LANG = l;
  localStorage.setItem('lang', l);
};
window.t = function (key, vars) {
  const dict = window.I18N[window.LANG] || window.I18N.en;
  let s = dict[key] != null ? dict[key] : (window.I18N.en[key] != null ? window.I18N.en[key] : key);
  if (vars) for (const k in vars) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
  return s;
};
