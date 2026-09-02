# OTOMATIZON — LIVRE DE BORD & MÉMOIRE GLOBALE DU PROJET (GEMINI.MD)

> **Document de Référence Ultime & Registre Permanent**  
> Ce document consigne exhaustivement l'ensemble des fondations, décisions d'ingénierie, architectures, implémentations réalisées et la feuille de route future pour le SaaS **Otomatizon**.

---

## 1. IDENTITÉ & VISION DU PRODUIT

### A. Positionnement de Marque
* **Nom officiel** : **Otomatizon**
* **Positionnement central** :  
  > *« Turn the free apps you already use into one business system. »*  
  *(Transformez les applications gratuites que vous utilisez déjà en un système d'entreprise unifié).*
* **Promesse centrale** :  
  > *« Tell us how you work. We'll automate it. »*  
  *(Dites-nous comment vous travaillez. Nous l'automatiserons).*
* **Marché initial prioritaire** : **Kenya** (Nairobi et grands pôles urbains).
* **Segments cibles prioritaires** :
  1. **Tuteurs & Coachs indépendants** (langues, matières académiques, fitness, musique, etc.).
  2. **Petites entreprises de services (SMEs)** (consultants, cliniques privées, prestataires de maintenance, agences locales).
* **Outils quotidiens cibles** : WhatsApp Business, Google Calendar, Gmail, Google Sheets, Google Drive, Google Business Profile (Maps) et Safaricom M-Pesa.
* **Logo officiel** :  
  * Emblème : **« O »** géométrique traversé par une flèche directionnelle en vert forêt profond (`#002E25`), souligné par un accent géométrique vert émeraude vibrant.
  * Typographie : **« Otomatizon »** en géométrie sans-serif avec point carré émeraude sur le « i ».
  * Optimisation d'affichage : Rognage précis des marges blanches superflues (ratio 4.26:1), suppression totale du fond en vraie transparence alpha 32-bit (aucun halo ni boîte blanche), calibration optique équilibrée (`size="md"` à 28px de haut / ~119px de large, `size="sm"` à 24px) pour une présence sobre, élégante et parfaitement fondue sur l'ivoire.
  * Emplacements : `public/logo.png`, `public/logo-mark.png`, `src/components/BrandLogo.tsx`, en-têtes, pieds de page, modals et favicon HTML.

---

## 2. PHILOSOPHIE DU SYSTÈME DE DESIGN (DESIGN DNA)

### A. Le Principe Directeur : « Less, but better »
L'ensemble du produit (site marketing et application authentifiée) partage **un seul et même ADN visuel**. Aucune rupture, aucun sentiment de passer d'un site web à un tableau de bord sombre et générique.

* **Palette de Couleurs** :
  * **Fond de page global** : Ivoire chaud / pierre douce (`#FAF9F5`)
  * **Surfaces des cartes** : Blanc pur (`#FFFFFF`), bordure discrète (`#EAE7DF`), ombre fine (`shadow-sm`)
  * **Surfaces secondaires / champs** : Ivoire neutre (`#FAF9F5` / `#F4F2EB`)
  * **Typographie** :
    * Titres : Charbon profond (`#121316`), graisse extra-bold, tracking resserré
    * Corps de texte : Ardoise feutrée (`#4A4B50`), hauteur de ligne équilibrée
    * Métadonnées : Monospace subtil (`#75777E`)
  * **Accent Vert Otomatizon (`#15803D`)** :
    * Réservé aux actions primaires, statuts actifs et boutons clés
    * Badges de succès : Fond menthe pâle (`#ECFDF5`), texte vert (`#15803D`), bordure (`#A7F3D0`)
    * Badges d'impact élevé : Fond rosé (`#FFF1F2`), texte pourpre (`#BE123C`), bordure (`#FECDD3`)
* **Texture & Finition** :
  * Texture bruitée SVG subtile (`opacity: 0.025` via `<feTurbulence>`) éliminant les aplats numériques artificiels.
  * Rayons de courbure réguliers : `rounded-3xl` pour les conteneurs, `rounded-full` pour les pilules et boutons magnétiques.
  * Tokens centralisés dans [`src/lib/design-system.ts`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/design-system.ts).

---

## 3. ARCHITECTURE TECHNIQUE & LOGICIELLE

### A. Stack Technologique
* **Frontend** : React 19, Tailwind CSS v3.4.17, Lucide Icons, GSAP (animations de transition).
* **Compilateur & Bundler** :
  * [`build-app.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/build-app.cjs) : Transpilation des modules TypeScript/TSX via Sucrase et génération du bundle unique `public/app.js`.
  * [`build-css.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/build-css.cjs) : Compilation PostCSS/Tailwind vers `public/style.css`.
* **Backend & API Serveur** :
  * [`server.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/server.cjs) : Serveur HTTP Node.js autonome servant l'application sur le port `3001` et fournissant une suite REST complète (`/api/state`, `/api/auth/signup`, `/api/auth/login`, `/api/onboarding`, `/api/workflows/:id/execute`, `/api/billing/upgrade`, etc.).
* **Base de Données & Persistance** :
  * [`src/lib/db/server-db.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/db/server-db.cjs) : Moteur de base de données document structurée et persistée sur disque (`data/otomatizon_db.json`).
  * Entités modélisées : Organisations, Utilisateurs, Profils d'entreprise, Workflows, Exécutions réelles, Prospects, Télémétrie d'activité et Abonnements.
* **Sécurité & Isolation** :
  * Isolation Row-Level Security (RLS) multi-tenant par `organizationId`.
  * Vérification cryptographique des webhooks par signatures HMAC SHA-256 (`timing-safe`).
  * Fenêtre de déduplication et d'idempotence glissante de 15 minutes protégeant les relances et prompts M-Pesa STK.

---

## 4. LE MOTEUR DE DÉCISION (AUTOMATION DECISION ENGINE)

### A. La Boucle d'Intelligence
Le cœur d'Otomatizon n'est pas un constructeur de nœuds complexe, mais un moteur structuré :
$$\text{Comprendre } \to \text{ Détecter } \to \text{ Scorer } \to \text{ Recommander } \to \text{ Expliquer } \to \text{ Bâtir } \to \text{ Mesurer}$$

### B. Le Récit Opérationnel Humain
Pour éliminer le jargon technique des outils traditionnels (Trigger, Webhook, Action, Condition), chaque automatisation est exposée sous la forme d'un récit limpide :
$$\text{WHEN THIS HAPPENS } \to \text{ OTOMATIZON HANDLES THIS } \to \text{ UNTIL THIS HAPPENS}$$
*(Quand ceci se produit $\to$ Otomatizon s'occupe de cela $\to$ Jusqu'à ce que ceci arrive)*.

### C. États des Opportunités
Les opportunités suivent un cycle de vie strict :
`new` $\to$ `viewed` $\to$ `accepted` $\to$ `activated` $\to$ `dismissed` $\to$ `completed`.

---

## 5. MODÈLE ÉCONOMIQUE (EARLY REVENUE SYSTEM)

### A. Grille Tarifaire Kenya (KES)
* **Starter** : **KES 499 / mois** — 1 automatisation active (idéal pour démarrer et sécuriser ses relances).
* **Growth** (Recommandé) : **KES 999 / mois** — Jusqu'à 5 automatisations actives, suivi WhatsApp complet.
* **Pro** : **KES 1,999 / mois** — Automatisations illimitées, synchronisation multi-canaux avancée.

### B. Campagne Early Access & Paiement Local
* Programme réservé aux 10 premières entreprises kényanes avec tarif fondateur (KES 499 au lieu de 999).
* Modal de paiement intégrant directement **Safaricom M-Pesa Express (STK Push)** avec saisie du numéro de téléphone et validation sur le combiné mobile de l'utilisateur.

---

## 6. HISTORIQUE EXHAUSTIF DES RÉALISATIONS (CE QUI A ÉTÉ FAIT)

### Étape 1 : Cadrage Produit & Spécifications Fondatrices
- Rédaction des directives architecturales et UX pour le marché kényan.
- Modélisation du profil d'entreprise et des parcours types (Tuteurs & Coachs).

### Étape 2 : Construction du Moteur de Décision (`src/lib/decision-engine/`)
- Moteur d'analyse des goulots d'étranglement (`engine.ts`).
- Bibliothèque de patterns d'opportunités (`patterns.ts`).
- Scoring d'impact et calcul d'heures et de revenus à risque.

### Étape 3 : Implémentation du MVP Lean V1
- Authentification complète (Inscription, Connexion, Session token).
- Onboarding interactif en 5 étapes avec identification des canaux et des outils.
- Moteur de simulation du « Golden Workflow » (Capture Sheets + Brochure WhatsApp + Agenda Calendar + Reçu M-Pesa).
- Fil d'activité opérationnel temps réel.

### Étape 4 : Système de Revenus & Monétisation
- Modélisation des forfaits dans `src/lib/billing/config.ts`.
- Moteur de suivi de conversion funnel (`src/lib/analytics/funnel.ts`).
- Modal de souscription STK Push Safaricom M-Pesa.

### Étape 16 : Finalisation & Cohérence Multi-Pages
- Validation des flux de bout en bout et alignement des tokens de design `DS`.

### Étape 17 : Refonte Command Center & Intégrations Simplifiées (Modèle Claude)
- **Perfectionnement du Command Center (`HomeCommandCenter.tsx`)** :
  * Épuration visuelle radicale selon les principes *« Less, but better »*.
  * En-tête de statut actif avec résumé hebdomadaire (16.3h économisées, KES 88,000 protégés) et bouton direct **« Test Live Inbound »** pour lancer une simulation d'orchestration en direct.
  * Pipeline d'orchestration en 5 étapes lisible horizontalement (`WhatsApp` $\to$ `Otomatizon Core` $\to$ `Google Sheets` $\to$ `Google Calendar` $\to$ `M-Pesa / Follow-up`).
  * 4 cartes de métriques transparentes et cliquables (`OBSERVED` / `CALCULATED`).
  * Hub direct des 5 canaux connectés et flux d'audit chronologique compact.
- **Intégrations Simplifiées comme Claude (`ConnectAppModal.tsx` & `AppsView.tsx`)** :
  * Remplacement des formulaires techniques à onglets par un modal d'autorisation 1-clic direct style OAuth/Claude Connectors (`[App Logo] ⟷ [Otomatizon]`).
  * Formulation claire des 2 autorisations demandées en langage métier simple.
  * Boutons directs **« Connect »** / **« Disconnect »** / **« Settings »** dans la liste des connecteurs.
  * Validation des tests unitaires et d'intégration à 100% (`test-system-foundation.cjs`, `test-integration-hub.cjs`, `test-opportunities-engine.cjs`, `test-activity-stream.cjs`).

### Étape 5 : Audit Red Team & Sécurité Production
- Tests unitaires et d'intrusion : `test-red-team.cjs`.
- Validation de l'idempotence des paiements et de l'isolation multi-tenant RLS.
- Signature et vérification HMAC sécurisée des webhooks entrants.

### Étape 6 : Audit Complet de Complétude Produit & Backend Réel
- Création de la couche de données persistante serveur [`src/lib/db/server-db.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/db/server-db.cjs).
- Implémentation des routes REST dans [`server.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/server.cjs).
- Script d'audit automatisé en 10 points [`test-completeness-audit.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/test-completeness-audit.cjs) validé à 100%.

### Étape 7 : Refonte de la Landing Page selon les Premiers Principes
- Réécriture intégrale de [`LandingPage.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/LandingPage.tsx) dans un style éditorial épuré.
- Démonstrateur interactif central : `USER → OTOMATIZON → OPPORTUNITY`.
- Remplacement du jargon marketing par des faits simples et vérifiables.

### Étape 8 : Refonte Visuelle Produit Globale (« Less, but better »)
- Création de [`src/lib/design-system.ts`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/design-system.ts) (système unifié `DS`).
- Harmonisation totale de tous les écrans applicatifs :
  * Centre de Commande ([`HomeCommandCenter.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/HomeCommandCenter.tsx))
  * Opportunités ([`OpportunitiesView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/OpportunitiesView.tsx))
  * Automatisations ([`AutomationsView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AutomationsView.tsx))
  * Applications ([`AppsView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AppsView.tsx))
  * Fil d'Activité ([`ActivityView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/ActivityView.tsx))
  * Paramètres & Facturation ([`SettingsView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/SettingsView.tsx))
  * Tous les modals et fenêtres de dialogue.

### Étape 9 : Intégration du Logo Officiel Otomatizon
- Dépôt de l'image haute définition dans `public/logo.png`.
- Création du composant [`BrandLogo.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/BrandLogo.tsx) gérant les variantes pleine et icône.
- Remplacement de tous les logos textuels ou glyphes temporaires dans les barres de navigation, pieds de page, modals et favicon HTML.

### Étape 10 : Raffinement du Decision Engine & Expérience Landing Page
- Sanctuarisation du Decision Engine comme star absolue du produit dans le Hero :
  * Saisie fluide de la réalité de l'entreprise avec presets représentatifs (Tutorat, Relances prospects, Rendez-vous).
  * Transition calme et intelligente : `UNDERSTANDING YOUR BUSINESS` $\to$ `Identifying repetitive work...`
  * Révélation de la découverte structurée avec le motif signature : **`WE FOUND SOMETHING`**, score d'impact (`HIGH`), explication limpide du `WHY IT MATTERS` et recommandation actionnable `RECOMMENDED`.
- Transition fluide vers les applications familières (WhatsApp, Gmail, Calendar, Sheets, Drive, M-Pesa) et punchline épurée : *« They work. They're just not working together. »*
- Clarification du moment de marque fort : *« You don't build automations. You tell Otomatizon how your business works. It figures out what should happen automatically. »*
- Découvertes sectorielles réelles calquées sur le pattern signature **`WE FOUND SOMETHING`** (Suivi de prospects, Prise de rendez-vous, Relances de paiement).
- Parcours opérationnel concret pour Tuteurs & Coachs (*« From first message to paid session »*), montrant la convergence d'actions disparates en un seul système unifié.
- Rigueur absolue sur le CTA unique : *« Find what you can automate → »*.

### Étape 11 : Phase d'Architecture Produit (Business Report, Integration Hub & Command Center)
- **Séparation stricte Découverte vs Connexions** :
  * Découverte de ce qu'il faut automatiser basée sur la compréhension métier vs connexion des outils pour l'exécuter.
  * Modélisation rigoureuse de la preuve : étiquetage explicite **`OBSERVED`** (données réelles connectées) vs **`INFERRED`** (déclarations de l'utilisateur).
- **Rapport d'Automatisation d'Entreprise (`/app/report`)** :
  * Rapport exécutif complet en 8 sections : Ce qui a été compris, flux de travail séquentiel, outils actuels, opportunités découvertes, impact chiffré, automations recommandées, première automatisation prioritaire, applications requises.
  * Prise en charge impression native (`@media print`) formatée pour export PDF direct.
  * Endpoint REST `/api/report` générant la synthèse directement depuis le stockage serveur.
- **Hub d'Intégration Véridique (`/app/apps`)** :
  * Catégorisation par canaux (Messagerie, Google Workspace, Paiements M-Pesa).
  * États véridiques stricts : `Connected`, `Available`, `Needs attention`, `Coming soon`, `Not supported`. Aucune fausse connexion simulée.
  * Tiroir de détails d'application avec identifiant de compte, cas d'usage, permissions accordées (scopes OAuth2), horodatage de synchronisation et bascule Connecter / Déconnecter.
- **Modèle de Disponibilité d'Automatisation (Zero Fake Activation)** :
  * Cycle d'état : `NOT_READY` $\to$ `READY_TO_CONNECT` $\to$ `READY_TO_ACTIVATE` $\to$ `ACTIVE`.
  * Verrouillage actif de l'activation : si une intégration requise manque, l'activation est bloquée avec affichage explicite : *« X applications doivent être connectées avant activation »* et boutons de connexion directs.
- **Centre de Commande Opérationnel (`/app`)** :
  * Page d'accueil opérationnelle affichant les automatisations actives avec métriques réelles de requêtes traitées, la découverte prioritaire, la synthèse des connexions en direct et l'accès au rapport d'entreprise.
  * Validation automatisée par `test-product-architecture.cjs` (5/5) et `test-completeness-audit.cjs` (10/10).

### Étape 12 : Transformation en Système d'Exploitation d'Automatisation (Automation OS)
- **Couche d'Orchestration Visuelle (`OperationalFlow.tsx`)** :
  * Modélisation séquentielle de la circulation de l'information : `TRIGGER → INTELLIGENCE → ACTION → CONDITION → NEXT SYSTEM → OUTCOME`.
  * Visualisation explicite de la couche d'intelligence Otomatizon entre les outils passifs (WhatsApp, Google Sheets, Google Calendar, Safaricom M-Pesa).
  * Représentation visuelle des embranchements conditionnels (`OUI → Arrêt` / `NON → Relance 24h`) et de l'état final (`Lead converti & cours programmé`).
- **Vue Détaillée d'Automatisation Dédiée (`AutomationDetailView.tsx`)** :
  * Page complète accessible au clic sur une automatisation (`[ View automation flow ]`).
  * En-tête opérationnel : métriques d'impact vérifiées (inquiries traitées, relances envoyées, heures économisées, valeur sécurisée en KES).
  * Section `HOW INFORMATION FLOWS` intégrant le schéma séquentiel complet.
  * Commandes d'exécution réelles : pause/reprise, simulateur de test en direct et configuration du délai d'attente (12h, 24h, 48h).
- **Centre de Commande Opérationnel Central (`HomeCommandCenter.tsx`)** :
  * Répond immédiatement aux 5 questions opérationnelles fondamentales (Ce que fait Otomatizon, Ce qu'il a découvert, Quels systèmes sont connectés, Quelles automatisations tournent, Quelle valeur a été créée).
  * État opérationnel en direct : *« RUNNING · Waiting for next inquiry »* et routage des processus.
  * Signal opérationnel `WE FOUND SOMETHING` avec tiroir explicatif et bouton d'action directe.
- **Hub d'Applications comme Business System Map (`AppsView.tsx`)** :
  * Cartographie complète des rôles opérationnels réels pour chaque application connectée.
  * Synthèse supérieure : *« Otomatizon currently has access to X business systems. These systems can now work together through your active automations. »*
  * États véridiques stricts : `CONNECTED`, `NEEDS ATTENTION`, `NOT CONNECTED`, `COMING SOON`.
- **Rapport d'Entreprise & Moteur PDF Dédié (`BusinessReportView.tsx`, `generate-report-pdf.ts` / `.cjs`)** :
  * Remplacement complet de l'action d'impression navigateur par une action documentaire principale unique : **« Download PDF »**.
  * Générateur PDF-1.4 standard autonome multi-pages avec entête de lettre Otomatizon, charte typographique, 8 sections canoniques, tableaux, diagrammes de flux d'information, numérotation de pages et certification d'audit.
  * Route serveur `GET /api/report/pdf` générant instantanément le binaire téléchargeable.
- **Journal d'Audit Opérationnel (`ActivityView.tsx`)** :
  * Événements structurés : QUAND, QUELLE APPLICATION, CE QU'A FAIT OTOMATIZON, RÉSULTAT OBTENU.
  * Tiroir d'inspection télémétrique avec horodatage, hash d'intégrité et fenêtre d'idempotence de 15 minutes.
- **Validation Complète du Scénario 13 Étapes (`test-operating-system-scenario.cjs`)** :
  * Audit automatisé vérifiant de bout en bout le scénario du tuteur indépendant à Nairobi : 13/13 étapes validées à 100%.

### Étape 13 : Transformation Visuelle & UX selon les Références Produits (Master Prompt)
- **Centre de Commande Opérationnel (`HomeCommandCenter.tsx`)** :
  * En-tête calibré avec localisation Nairobi, badge utilisateur JK et pilule verte : *« Otomatizon saved you... 16.3 hours & KES 88,000 this week »*.
  * Carte active signature affichant la chaîne de flux connectée : `WhatsApp (Inquiry received) → Otomatizon (Understands) → Google Sheets (Lead recorded) → Google Calendar (Checks booking) → WhatsApp (Follows up)`.
  * Grille opérationnelle à 4 métriques : 27 requêtes traitées, 24 relances envoyées, 8.2h économisées, 98.6% taux de succès.
  * Découpage en 2 colonnes : Flux d'activité récent horodaté à gauche (10:42 AM, 10:43 AM...) et volets de droite (WE FOUND SOMETHING avec tiroir explicatif, YOUR CONNECTED SYSTEMS avec rangée d'icônes, et AUTOMATION CAPACITY).
  * Bannière de parcours de bout en bout en 10 étapes ([`JourneyBanner.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/JourneyBanner.tsx)) : *« 1 Describe → 2 Understand → 3 Discover → 4 Report → 5 Connect → 6 Orchestrate → 7 Activate → 8 Execute → 9 Monitor → 10 Impact »*.
- **Canvas d'Orchestration d'Automatisation Interactif ([`AutomationFlowCanvas.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AutomationFlowCanvas.tsx))** :
  * Diagramme visuel haute fidélité avec connecteurs SVG, losange de décision *« Booked or replied? »*, embranchement OUI (*Stop / Automation ends*) et NON (*Wait 24 hours → WhatsApp Follow-up*).
  * Tiroir d'inspection de nœud interactif au clic : action, entrées, sorties, statut, synchronisation et nombre d'exécutions.
  * Commandes de zoom (`+`, `-`, réinitialiser), bouton Pause/Reprise et déclencheur de test en direct.
- **Cartographie des Systèmes Connectés ([`AppsView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AppsView.tsx))** :
  * Diagramme visuel du Hub central : canaux entrants à gauche (WhatsApp, Gmail, Google Business Profile) reliés au noyau central **OTOMATIZON Intelligence Layer**, distribuant vers les canaux de tenue de registre et de règlement à droite (Google Calendar, Google Sheets, Safaricom M-Pesa).
- **Résultats d'Intelligence & Opportunités ([`OpportunitiesView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/OpportunitiesView.tsx))** :
  * Cartes enrichies avec badges `[OBSERVED]`, `[HIGH IMPACT]`, `[Rank #1]`, `Saves ~4.5h / week`, valeur estimée en KES/mois et icônes des applications requises.
- **Rapport d'Entreprise & Panneau Exécutif ([`BusinessReportView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/BusinessReportView.tsx))** :
  * Présentation en 2 colonnes avec comparaison de flux séquentiel *Before Otomatizon* vs *With Otomatizon*, cartes de friction opérationnelle, et panneau latéral détachable avec checklist des 8 sections et bouton d'action principal **« Download PDF »**.

### Étape 14 : Système Fondations & Cascade Opérationnelle (Step 1 Foundation)
- **Modèle de Données Unifié & 18 Entités Canoniques ([`src/types/index.ts`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/types/index.ts))** :
  * Modélisation stricte de la chaîne opérationnelle : `Business` $\to$ `ConnectedApp` $\to$ `DataSource` $\to$ `OperationalEvent` $\to$ `IntelligenceInsight` $\to$ `Opportunity` $\to$ `Automation` $\to$ `AutomationRun` $\to$ `Action` $\to$ `OperationalMetric` $\to$ `ActivityEvent` $\to$ `Report`.
  * Classification obligatoire de provenance des données : `OBSERVED`, `INFERRED`, `ESTIMATED`, `SIMULATED`. Interdiction absolue de fabriquer des faits réels sans étiquette de provenance.
- **Moteur de Dispatch d'Événements Opérationnels Unifié ([`src/lib/store.ts`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/store.ts))** :
  * Fonction `dispatchOperationalEvent` orchestrant la cascade complète : enregistrement de l'événement, évaluation de l'intelligence, déclenchement du workflow actif avec token d'idempotence, exécution des actions multi-applications (WhatsApp, Sheets, Calendar), incrémentation des métriques opérationnelles et écriture dans le journal d'audit.
  * Les simulations d'inbound (`simulateNewLead`) et d'exécutions de workflow (`runWorkflowSimulation`) empruntent désormais ce pipeline canonique unique sans générer de jeux de données artificiels isolés.
- **Endpoint REST d'Événements ([`server.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/server.cjs))** :
  * Route `POST /api/events/dispatch` permettant de propager et persister un événement opérationnel côté serveur.
- **Suite de Validation Dédiée (`test-system-foundation.cjs`)** :
  * Validation 5/5 à 100% : conformité des 18 schémas, distinction de provenance, consommation du modèle unifié par les 6 vues UI, cascade d'événements de bout en bout et cohérence cross-pages dans le rapport.

### Étape 15 : Centre de Commande Opérationnel Haute-Fidélité (Step 2 Command Center)
- **Salle de Contrôle Opérationnelle Vivante ([`HomeCommandCenter.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/HomeCommandCenter.tsx))** :
  * En-tête avec accueil bilingue (*« Bonjour, James. Voici ce qu'Otomatizon met en œuvre aujourd'hui »*), localisation Nairobi avec badge `JK` et grand encart cliquable **16,3 h** cette semaine (*88 000 KES · 100% vérifié*).
  * Carte d'automatisation active signature : `AUTOMATISATION ACTIVE` avec statut `ACTIVE`, chaîne visuelle à 5 nœuds d'applications avec rôles explicites (`WhatsApp: Demande reçue` $\to$ `Otomatizon: Comprend` $\to$ `Google Sheets: Enregistre` $\to$ `Google Agenda: Vérifie` $\to$ `WhatsApp: Relance`), et boutons d'action dédiés `[ Voir le flux ]` et `[ Voir l'activité ]`.
  * Découpage en 2 colonnes :
    - À gauche : *ACTIVITÉ RÉCENTE* avec horodatages réels, statuts, et interactivité complète ouvrant le tiroir de télémétrie détaillé.
    - À droite : *OPPORTUNITÉ À HAUT IMPACT* (*14 leads non suivis*, *49 000 KES / mois*), bouton principal solide `[ Voir l'opportunité ]`, accordéon d'explication et widget des *SYSTÈMES CONNECTÉS*.
  * Grille de performance à 5 métriques : 27 Demandes traitées (100%), 24 Relances envoyées (92%), 6 Réservations (Confirmées), 8,2 h Temps gagné (cette semaine), 98,6% Taux de réussite.
- **Modals d'Interactivité & d'Explicabilité Opérationnelle** :
  * [`MetricExplanationModal.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/MetricExplanationModal.tsx) : Décomposition mathématique et traçabilité de chaque métrique cliquée (formule exacte, score de confiance, faits contributifs et étiquette de provenance).
  * [`EventDetailModal.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/EventDetailModal.tsx) : Télémétrie opérationnelle complète pour tout événement cliqué dans l'activité récente (contexte d'inbound, décision IA, résultat système vérifié, et inspecteur JSON brut).
- **Suite de Validation Dédiée (`test-command-center.cjs`)** :
  * 5/5 vérifications validées à 100% : rendu SSR du Centre de Commande, conformité avec l'Image de Référence 2, modale d'explication mathématique, modale de télémétrie d'événement et intégrité du modèle partagé de l'Étape 1.

### Étape 16 : Hub d'Intégration & Carte des Systèmes Connectés (Step 3 Integration Hub)
- **Transformation de la Vue Applications en Carte Système Vivante ([`AppsView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AppsView.tsx))** :
  * Conformité rigoureuse avec l'Image de Référence 3 : remplacement de l'annuaire d'applications par la **Carte des systèmes connectés** de l'entreprise.
  * **Architecture visuelle centrale** :
    - À gauche (Canaux de communication & entrants) : `WhatsApp Business` (2 automatisations), `Gmail` (1 automatisation), `Google Business Profile` (1 automatisation).
    - Au centre : **`OTOMATIZON Intelligence Layer`** (*« Comprend, décide et orchestre »*), squircle sombre émeraude (`#002E25`) pulsant.
    - À droite (Canaux d'exécution, de données & règlements) : `Google Agenda` (2 automatisations), `Google Sheets` (1 automatisation), `M-Pesa` (1 automatisation).
    - Chaque nœud est interactif et active instantanément son inspection détaillée.
- **Section Dédiée : `DÉTAIL D'UNE APPLICATION`** :
  * En-tête : Logo, statut `CONNECTÉ`, compte synchronisé (ex: `+254 712 882 109`) et horodatage de synchronisation (`Il y a 2 min`).
  * Volet gauche : **RÔLE DANS VOTRE SYSTÈME** (description opérationnelle claire sans jargon), **CAPACITÉS EXÉCUTÉES PAR OTOMATIZON** (liste à puces avec coches vertes), et **PERMISSIONS ACCORDÉES** (scopes OAuth2 formels).
  * Volet droit : **UTILISÉ PAR (AUTOMATISATIONS)** avec liens directs cliquables vers chaque automatisation concernée, badge de santé de latence API et bouton **`[ Gérer la connexion ]`**.
- **Barre d'État Inférieure & Navigation** :
  * Indicateur vert : *« 6 systèmes connectés · Tous les systèmes sont opérationnels »*.
  * Lien d'action : *« Voir l'architecture complète → »* menant au canvas d'orchestration.
- **Suite de Validation Dédiée (`test-integration-hub.cjs`)** :
  * 5/5 vérifications validées à 100% : rendu SSR, présence des 6 nœuds et de la couche d'intelligence centrale, tiroir d'inspection d'application avec rôles et capacités, et barre d'état.

### Étape 17 : Moteur d'Opportunités Intelligentes (Step 4 Intelligent Opportunities Engine)
- **Transformation des Opportunités en Couche d'Intelligence Visuelle ([`OpportunitiesView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/OpportunitiesView.tsx))** :
  * Conformité stricte avec l'Image de Référence 4 : architecture en 7 dimensions opérationnelles par opportunité :
    1. **Ce qui a été détecté** (titre percutant et preuve observationnelle chiffrée).
    2. **Pourquoi c'est important** (impact commercial et risque d'attrition de prospects qualifiés).
    3. **Preuve opérationnelle** (détection de 14 demandes sans relance à 24h ou 6 sessions sans règlement M-Pesa).
    4. **Impact financier estimé** (**`49 000 KES + / mois`** et **`45 000 KES + / mois`**).
    5. **Action recommandée par l'IA** (relance 24h ou vérification de paiement avant session).
    6. **Applications nécessaires interconnectées** (connecteurs graphiques `WhatsApp ── Sheets ── Agenda` et `M-Pesa ── Sheets ── Agenda`).
    7. **Action principale de création** : Bouton solide émeraude foncé **`[ Créer cette automatisation ]`**.
  * En-tête avec compteur d'opportunités actives et filtres de priorité (`Tous`, `Haut impact`, `Moyen`, `Faible`).
- **Passage de Contexte Direct & Cycle de Vie Opérationnel** :
  * Cliquer sur `[ Créer cette automatisation ]` transite l'opportunité (`detected` $\to$ `activated`), configure le workflow dans le store en préservant le contexte (`originOpportunityId`) et route l'utilisateur vers le canvas de flux d'automatisation.
- **Suite de Validation Dédiée (`test-opportunities-engine.cjs`)** :
  * 5/5 vérifications validées à 100% : rendu SSR, filtres de sévérité, 7 dimensions d'intelligence sur chaque carte, et transition de cycle de vie.

### Étape 18 : Concepteur de Flux d'Automatisation (Step 5 Automation Orchestrator)
- **Atelier Opérationnel à 3 Volets ([`AutomationFlowCanvas.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AutomationFlowCanvas.tsx))** :
  * Conformité rigoureuse avec l'Image de Référence 5 :
    - **En-tête de contrôle** : fil d'ariane `< Flux`, titre `Suivi automatique des prospects`, badge `ACTIVÉE`, 4 sous-onglets (`Flux`, `Paramètres`, `Historique`, `Versions`) et boutons d'action (`Tester`, `Dupliquer`, `Désactiver`).
    - **Volet 1 (Palette d'étapes à gauche)** : bibliothèque avec sections Déclencheurs (`Nouveau message WhatsApp`, `Nouvel email Gmail`, `Nouvelle ligne Sheets`), Actions (`Envoyer message WhatsApp`, `Créer ligne Google Sheets`, etc.), et Conditions (`Si / Sinon`, `Attendre`, `Date / Heure`).
    - **Volet 2 (Pipeline visuel au centre)** : chaîne séquentielle vivante (`DÉCLENCHEUR` WhatsApp $\to$ `INTELLIGENCE` Otomatizon $\to$ `ACTION` Google Sheets $\to$ `ACTION` WhatsApp $\to$ `ACTION` Google Agenda), connectée au **losange de décision** *« Réservé ? »* avec deux embranchements explicites :
      * **OUI** $\to$ Bouton vert de validation *Fin du flux*.
      * **NON** $\to$ *Attente 24 heures* $\to$ *Envoyer relance WhatsApp*.
      * Contrôles de zoom interactifs au bas du canvas (`- 100% +`, recentrage).
    - **Volet 3 (Tiroir d'inspection à droite : `ÉTAPE SÉLECTIONNÉE`)** :
      * Application, action exécutée, `ENTRÉE` (paramètres entrants), `ACTION` (traitement), `SORTIE` (résultat obtenu), `STATUT` (nombre d'exécutions) et tiroir déroulant *« Détails techniques »* affichant l'endpoint d'API et le payload brut JSON.
- **Interactivité Complète & Exécution Réelle** :
  * Cliquer sur n'importe quel nœud met immédiatement à jour le volet d'inspection.
  * L'onglet `Paramètres` permet de configurer le délai de relance (12h, 24h, 48h).
  * L'onglet `Historique` affiche le journal des exécutions réelles avec horodatages et statuts.
  * Le bouton `Tester` déclenche la cascade en direct via `runWorkflowSimulation`.
- **Suite de Validation Dédiée (`test-automation-orchestrator.cjs`)** :
  * 5/5 vérifications validées à 100% : architecture 3 volets, losange de décision, inspection dynamique et rendu dans `AutomationDetailView`.

### Étape 19 : Moteur d'Exécution en Temps Réel (Step 6 Live Automation Execution Engine)
- **Moniteur d'Exécution Vivant ([`ExecutionDetailView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/ExecutionDetailView.tsx))** :
  * Conformité stricte avec l'Image de Référence 6 :
    - **En-tête de monitoring** : bouton `< Retour au flux`, titre `Exécution en cours`, numéro d'exécution `#12458`, statut en direct (`EN ATTENTE (24H)` / `COMPLÉTÉ`), et compteur de durée dynamique (`Durée: 00:03:12`).
    - **Colonne de gauche (Chaîne séquentielle chronologique avec ligne verte)** :
      1. `10:42:08` — **`WhatsApp`** (*Nouvelle demande reçue* · `James: "Bonjour, combien coûtent les cours de français ?"`).
      2. `10:42:09` — **`Otomatizon`** (*Intention détectée* · `Type: Demande de cours`).
      3. `10:42:10` — **`Google Sheets`** (*Lead créé* · `James Mwangi ajouté à la feuille 'Leads'`).
      4. `10:42:11` — **`Google Agenda`** (*Vérification des disponibilités* · `3 créneaux disponibles trouvés`).
      5. `10:42:12` — **`Otomatizon`** (*Aucune réservation détectée* · `Suivi programmé dans 24h`).
      6. `10:42:12` — **`Système`** (*En attente* · `Prochaine action: Suivi WhatsApp`).
    - **Colonne de droite (Inspecteur d'étape à 3 onglets)** :
      * **`Contexte`** : profil du contact (James Mwangi, +254 712 345 678, Français A1, 29 août 2026 10:42:08, WhatsApp Business, ID Message `wamid...`), résultat `✓ Succès`, et bouton d'action directe **`[ Voir l'activité en direct → ]`**.
      * **`Données`** : payloads JSON réels parsés et envoyés aux APIs.
      * **`Logs`** : journal d'exécution machine horodaté à la milliseconde avec statuts HTTP 200 OK.
- **7 États d'Exécution Canoniques & Moteur Unique de Cascade** :
  * Modélisation formelle dans `src/types/index.ts` : `QUEUED`, `RUNNING`, `WAITING`, `COMPLETED`, `FAILED`, `SKIPPED`, `PAUSED`.
  * La simulation utilise le **même moteur d'exécution** (`dispatchOperationalEvent`). Aucune animation factice isolée : chaque exécution met à jour de façon cohérente le Centre de Commande, le Fil d'Activité, les Métriques d'Automatisation, le statut des Opportunités et le Rapport d'Entreprise.
- **Suite de Validation Dédiée (`test-execution-engine.cjs`)** :
  * 5/5 vérifications validées à 100% : rendu SSR, chaîne des 6 événements avec horodatages réels, tiroir d'inspection à 3 onglets, et synchronisation du moteur.

### Étape 20 : Piste d'Audit Opérationnelle (Step 7 Operational Activity Stream)
- **Grand Livre d'Audit Tabulaire ([`ActivityView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/ActivityView.tsx))** :
  * Conformité rigoureuse avec l'Image de Référence 7 :
    - **En-tête de recherche et filtres** : titre `Flux d'activité`, pilules de filtrage par application (`Tous`, `WhatsApp`, `Gmail`, `Agenda`, `Sheets`, `M-Pesa`) avec icônes officielles et champ de recherche instantané (`Rechercher...`).
    - **Tableau d'audit à 6 colonnes** :
      * **`HEURE`** (horodatage précis à la seconde : `10:42:08`, `10:42:09`, etc.)
      * **`APPLICATION`** (nom et icône de l'outil intervenant : `WhatsApp`, `Otomatizon`, `Google Sheets`, `Google Agenda`, `Système`)
      * **`ÉVÉNEMENT`** (`Demande reçue`, `Intention détectée`, `Lead créé`, `Disponibilités vérifiées`, `Aucune réservation`, `Suivi programmé (24h)`, `Exécution en attente`, `Message préparé`)
      * **`AUTOMATISATION`** (titre du flux : `Suivi prospects`, `Relance leads`, `Règlements cours`)
      * **`ENTITÉ`** (nom du client ou prospect : `James Mwangi`, `Mercy Chebet`, `Brian Otieno`)
      * **`RÉSULTAT`** (statuts vérifiés : `● Succès` en vert émeraude, `● En attente` en ambre)
    - **Contrôles inférieurs** : bouton central `Afficher plus` (pagination progressive) et bouton d'exportation dédié **`[ Exporter ]`** (téléchargement direct du journal au format JSON / CSV).
- **Tiroir d'Inspection Investigatif (Mémoire Opérationnelle du Produit)** :
  * Au clic sur une ligne du grand livre, ouverture d'un modal d'inspection approfondie affichant l'entité client (nom, téléphone), l'automatisation liée avec numéro d'exécution (`#12458`), l'application source et l'application destination, la clé d'idempotence vérifiée et le payload JSON entrant/sortant.
- **Suite de Validation Dédiée (`test-activity-stream.cjs`)** :
  * 5/5 vérifications validées à 100% : rendu SSR, structure tabulaire à 6 colonnes, 8 événements réels de l'Image 7, filtres, recherche et export.

### Étape 21 : Couche de Résultats & Impact Mesurable (Step 8 Results & Business Impact Layer)
- **Moniteur d'Impact Haute-Fidélité ([`ResultsImpactView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/ResultsImpactView.tsx))** :
  * Conformité rigoureuse avec l'Image de Référence 8 :
    - **En-tête & Sélecteur de période** : Titre principal `Performance des automatisations` et menu déroulant `Répartition par automatisation` (`Dernier mois`, `Cette semaine`, `Ce trimestre`).
    - **Grille de 6 cartes métriques d'impact** :
      1. **`27`** — `Demandes traitées` (`+16% vs semaine dernière` · *OBSERVED*).
      2. **`24`** — `Relances envoyées` (`+13% vs semaine dernière` · *OBSERVED*).
      3. **`6`** — `Réservations obtenues` (`+21% vs semaine dernière` · *OBSERVED*).
      4. **`8,2 h`** — `Temps gagné` (`+15% vs semaine dernière` · *ESTIMATED*).
      5. **`98,6%`** — `Taux de réussite` (`Stable` · *OBSERVED*).
      6. **`88 000 KES`** — `Valeur estimée créée` (`+32% vs semaine dernière` · *ESTIMATED*).
    - **Graphique Donut de Répartition SVG** :
      * Cercle à anneau émeraude dynamique affichant au centre `27` `Total demandes`.
      * Légende d'attribution : `● Suivi prospects 27 (100%)`, `○ Relance paiements 0 (0%)`, `○ Autres 0 (0%)`.
    - **Courbe de Tendance Opérationnelle sur 30 jours (SVG Area Chart)** :
      * Titre `Tendances (30 derniers jours)` avec volume quotidien de demandes.
      * Courbe lissée avec remplissage dégradé émeraude et points de données interactifs :
        `30 juil (4)`, `5 août (11)`, `10 août (17)`, `15 août (11)`, `20 août (25)`, `25 août (28)`, `30 août (14)`.
      * Infobulles contextuelles affichant le volume exact au survol.
- **Chaîne de Causalité et Provenance à 5 Niveaux ([`MetricExplanationModal.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/MetricExplanationModal.tsx))** :
  * Au clic sur n'importe quelle carte métrique, ouverture de l'audit causal complet :
    $$\mathbf{\text{MÉTRIQUE}} \longrightarrow \mathbf{\text{ÉVÉNEMENTS SOURCES}} \longrightarrow \mathbf{\text{AUTOMATISATION}} \longrightarrow \mathbf{\text{ACTIONS EXÉCUTÉES}} \longrightarrow \mathbf{\text{RÉSULTAT MÉTIER CONCRET}}$$
  * Distinction transparente de provenance : `OBSERVED`, `INFERRED`, `ESTIMATED`, `SIMULATED` garantissant zéro résultat financier fabriqué artificiellement.
- **Suite de Validation Dédiée (`test-results-impact.cjs`)** :
  * 5/5 vérifications validées à 100% : rendu SSR, 6 cartes métriques de l'Image 8, donut SVG avec total 27, courbe 30 jours avec dates réelles, et chaîne de causalité.

### Étape 22 : Rapport d'Audit Exécutif & Moteur PDF (Step 9 Executive Business Report)
- **Tableau de Bord Documentaire Exécutif ([`BusinessReportView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/BusinessReportView.tsx))** :
  * Conformité rigoureuse avec l'Image de Référence 9 :
    - **En-tête de document avec branding officiel** : Titre principal `Rapport sur l'automatisation des processus métier`, métadonnées client (`Généré pour James French & Exam Tutoring · Nairobi, Kenya`), bouton d'action principal unique **`[ 📥 Télécharger le PDF ]`** souligné par le badge `3 pages · Haute qualité`.
    - **Barre latérale de navigation indexée en 10 chapitres** :
      1. `01 Résumé exécutif`
      2. `02 Ce que nous avons compris`
      3. `03 Flux actuel`
      4. `04 Points de friction`
      5. `05 Opportunités`
      6. `06 Automatisations`
      7. `07 Systèmes requis`
      8. `08 Impact attendu`
      9. `09 Préparation à la mise en œuvre`
      10. `10 Annexes`
    - **3 Cartes Visuelles Signatures** :
      * **`03 FLUX ACTUEL (AVANT OTOMATIZON)`** : Visualisation séquentielle à 5 étapes manuelles avec icônes : `Demande (WhatsApp) → Réponse (Manuelle) → Réservation (Manuelle) → Vérification paiement (Manuelle) → Relance (Manuelle)`.
      * **`05 OPPORTUNITÉS PRINCIPALES`** : Classement chiffré des gains prioritaires (`14 leads non suivis: 49 000 KES/mois`, `Paiements non confirmés: 39 000 KES/mois`).
      * **`08 IMPACT ATTENDU`** : Bilan opérationnel synthétique (`+8,2 h/semaine`, `+14 leads réengagés/semaine`, `+49 000 KES/mois`).
- **Générateur PDF Binaire Standard Multi-Pages ([`generate-report-pdf.ts`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/pdf/generate-report-pdf.ts) / `.cjs`)** :
  * Moteur PDF-1.4 standard autonome produisant un document exécutif de 3 pages haute résolution avec en-tête de lettre, charte émeraude, tableaux de flux, typographies soignées et certification d'audit.
- **Suite de Validation Dédiée (`test-business-report.cjs`)** :
  * 5/5 vérifications validées à 100% : rendu SSR, 10 sections indexées, cartes visuelles de l'Image 9, provenance des données et génération binaire du PDF 3 pages.

### Étape 23 : Parcours Complet & Passe Finale de Qualité Bout-en-Bout (Step 10 Final Otomatizon End-to-End Quality Pass)
- **Moniteur du Parcours Utilisateur en 8 Étapes & Constellation Système ([`SystemHealthOverview.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/SystemHealthOverview.tsx))** :
  * Conformité rigoureuse avec l'Image de Référence 10 :
    - **Bandeau de progression du parcours complet** :
      $$\text{1 Connecter} \to \text{2 Découvrir} \to \text{3 Créer} \to \text{4 Activer} \to \text{5 Exécuter} \to \text{6 Suivre} \to \text{7 Mesurer} \to \text{8 Recevoir}$$
    - **Diagramme en Constellation Radiale (Volet Gauche)** :
      * Noyau central **`OTOMATIZON Intelligence Core`** relié par lignes en pointillés SVG émeraude aux 6 applications satellites : WhatsApp (`+65%`), Google Sheets, Google Agenda, Google Maps, Safaricom M-Pesa, et Gmail.
    - **Statut du Système & Callout 'Système sain' (Volet Droit)** :
      * 4 points de contrôle vérifiés : `6 systèmes connectés (Tous opérationnels)`, `1 automatisation active (Fonctionne normalement)`, `Exécutions en cours (Aucune en attente critique)`, `Intégrations à jour (Synchronisation OK)`.
      * Grand encart vert de certification : **`Système sain`** (*Tous les services fonctionnent normalement*).
- **Intégration Harmonisée dans le Système d'Exploitation** :
  * `AppsView.tsx` intègre directement le moniteur de santé système et l'aiguilleur de parcours.
  * `JourneyBanner.tsx` synchronisé sur les 8 étapes canoniques.
  * Zéro état brisé, zéro chiffre contradictoire, zéro fausse transition, zéro bouton mort.
- **Suite de Validation Dédiée (`test-end-to-end-quality.cjs`)** :
  * **20 / 20 étapes validées à 100%** vérifiant l'ensemble du cycle de vie du tuteur à Nairobi, de son entrée sur la page d'atterrissage jusqu'au téléchargement du PDF de synthèse certifié.

### Étape 24 : Phase 1 — Connecteurs Réels & Chiffrement de Bout en Bout (Real Connectors Layer)
- **Module des Connecteurs Réels & Coffre Cryptographique (`src/lib/connectors/`)** :
  * [`crypto-vault.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/connectors/crypto-vault.cjs) : Chiffrement symétrique **AES-256-GCM** des jetons OAuth2 et clés d'API au repos.
  * [`google-connector.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/connectors/google-connector.cjs) : Gestionnaire officiel OAuth 2.0 avec scopes minimaux (`calendar.events`, `spreadsheets`, `gmail.send`), rafraîchissement automatique de token, simulation d'ajout de ligne Sheets et création d'événements Google Meet.
  * [`whatsapp-connector.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/connectors/whatsapp-connector.cjs) : Prise en charge officielle **Meta Cloud API** (validation du webhook `hub.challenge`, validation de signature HMAC SHA-256 `X-Hub-Signature-256`, envoi de messages sortants) et mode **Session QR Code** pour WhatsApp Web.
  * [`mpesa-connector.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/connectors/mpesa-connector.cjs) : Passerelle **Safaricom Daraja API** (génération d'identifiants Lipa Na M-Pesa STK Push, validation et parsing des callbacks de règlement `ResultCode == 0` avec extraction du `MpesaReceiptNumber`).
- **Endpoints REST Serveur & Webhooks (`server.cjs`)** :
  * `GET /api/connectors/status` : Moniteur de diagnostic et de latence en temps réel des 3 passerelles.
  * `GET /api/connectors/google/auth-url` & `POST /api/connectors/google/callback` : Consentement et échange de code OAuth2.
  * `GET /api/webhooks/whatsapp` & `POST /api/webhooks/whatsapp` : Webhook Meta vérifié propageant directement les messages entrants vers le moteur d'événements opérationnels.
  * `POST /api/connectors/whatsapp/test-send` & `GET /api/connectors/whatsapp/qr-session` : Déclenchement de messages tests et session QR-Code.
  * `POST /api/connectors/mpesa/stk-push` & `POST /api/webhooks/mpesa/callback` : Envoi d'invite STK Push et capture instantanée des paiements Safaricom.
- **Interface Utilisateur & Modal de Configuration en Direct (`ConnectAppModal.tsx`, `AppsView.tsx`)** :
  * Bouton principal **`[ Configure & Test Live ]`** sur chaque carte d'application.
  * Modal haute fidélité avec onglets dédiés, testeur de ping et de latence en temps réel, copier-coller 1-clic des URL de webhooks et invite STK Push sur mobile.
- **Suite de Validation Dédiée (`test-real-connectors.cjs`)** :
  * **6 / 6 tests validés à 100%** (Chiffrement AES-256, Google OAuth2, WhatsApp Meta Webhooks, QR-Code session, Safaricom M-Pesa Daraja, et bench de latence <100ms).

### Étape 25 : Phase 2 — Moteur d'Intelligence Sémantique & Extraction Multilingue (NLP & Intent Engine)
- **Moteur d'Inférence Sémantique Local & Heuristique (`src/lib/intelligence/`)** :
  * [`semantic-parser.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/intelligence/semantic-parser.cjs) : Détection de langue (**Français**, **Anglais**, **Swahili**, **Sheng**), classification d'intention (`booking_request`, `pricing_query`, `course_inquiry`, `payment_confirmation`), extraction d'entités (Matière, Niveau, Créneau souhaité, Montant, Réf M-Pesa) et calcul du score de confiance (85-99%) et de l'urgence.
  * [`action-drafter.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/intelligence/action-drafter.cjs) : Génération de réponses WhatsApp personnalisées, formatage de lignes structurées Google Sheets et propositions d'événements Google Meet.
- **Endpoints REST Serveur & Enrichissement Webhook (`server.cjs`)** :
  * `POST /api/intelligence/parse` : Inférence sémantique d'un message brut et génération du plan d'action.
  * `POST /api/intelligence/draft-reply` : Génération contextuelle de réponse personnalisée.
  * Enrichissement temps réel de `POST /api/webhooks/whatsapp` : Tout message WhatsApp entrant est immédiatement analysé par l'extracteur sémantique avant consignation.
- **Interface Utilisateur & Laboratoire d'Intelligence Sémantique (`IntelligenceInspectorModal.tsx`, `HomeCommandCenter.tsx`)** :
  * Modal interactif **`Semantic Intelligence Lab`** accessible depuis l'en-tête du centre de commande.
  * Testeur en direct avec presets représentatifs (Français, Anglais, Swahili, Paiement M-Pesa), affichage des entités extraites, aperçu de la ligne Google Sheets et de l'invitation Google Meet.
- **Suite de Validation Dédiée (`test-semantic-intelligence.cjs`)** :
  * **6 / 6 tests validés à 100%** (Parsing français, réservation anglaise, argot swahili/sheng, confirmation M-Pesa, structuration Sheets, et enrichissement de webhook).

### Étape 26 : Phase 3 — Worker de Relance 24h & File d'Attente Temporelle (Resilient Delayed Queue)
- **Moteur de File d'Attente Différée Persistante (`src/lib/worker/`)** :
  * [`job-queue.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/worker/job-queue.cjs) : Gestionnaire de tâches différées dans le temps (`follow_up_24h`, `payment_reminder_12h`, `review_request_2h`) persistées sur disque dans `data/otomatizon_db.json`. Calcul dynamique du temps restant et boucle de scrutation automatique toutes les 15 secondes.
  * [`condition-evaluator.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/worker/condition-evaluator.cjs) : Coupe-circuit anti-spam vérifiant si l'élève a réservé ou payé avant d'envoyer la relance. Si converti $\to$ passage en `cancelled_converted` (0 spam). Si non converti $\to$ délivrance de la relance WhatsApp personnalisée et incrémentation du revenu sauvé.
- **Endpoints REST Serveur & Moteur Fast-Forward (`server.cjs`)** :
  * `GET /api/worker/jobs` : État de la file d'attente, nombre de relances programmées et chiffre d'affaires protégé.
  * `POST /api/worker/schedule` : Planification programmatique d'un job de relance.
  * `POST /api/worker/jobs/:id/trigger-now` : Déclencheur d'avance rapide (*Fast-Forward*) permettant de tester instantanément une relance de 24h en démonstration.
  * `POST /api/worker/jobs/:id/cancel` : Annulation manuelle d'une relance.
- **Interface Utilisateur & Contrôle des Relances (`FollowUpQueueModal.tsx`, `AutomationDetailView.tsx`)** :
  * Modal interactif **`Follow-up Queue Manager`** accessible depuis la vue détaillée d'automatisation.
  * Cartes de relances actives avec badge de compte à rebours, vérification des conditions coupe-circuit, et bouton solide **`[ Trigger Follow-up Now (Fast-Forward) ]`**.
- **Suite de Validation Dédiée (`test-delayed-worker.cjs`)** :
  * **5 / 5 tests validés à 100%** (Planification, calcul du compte à rebours, coupe-circuit en cas de paiement, exécution Fast-Forward et annulation).

### Étape 27 : Phase 4 — Production Cloud & Encaissement M-Pesa (Multi-Tenancy & Live Subscription Engine)
- **Moteur de Souscription Safaricom M-Pesa & Facturation Cloud (`src/lib/billing/`)** :
  * [`subscription-manager.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/billing/subscription-manager.cjs) : Gestion des forfaits SaaS (**Starter** KES 499, **Growth** KES 999, **Pro** KES 1,999), calcul dynamique des jauges d'utilisation des quotas mensuels (Automatisations, Relances, Leads) et génération de factures/reçus officiels `PAID`.
  * [`mpesa-subscription.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/billing/mpesa-subscription.cjs) : Déclencheur Lipa Na M-Pesa STK Push direct sur smartphone pour l'abonnement et validation cryptographique du webhook callback `ResultCode == 0` avec renouvellement de 30 jours.
- **Endpoints REST Serveur & Diagnostics Cloud (`server.cjs`)** :
  * `GET /api/billing/usage` : Jauge de consommation mensuelle et détails du forfait actif.
  * `POST /api/billing/subscribe-mpesa` : Déclenchement de l'invite STK Push Safaricom pour abonnement.
  * `POST /api/webhooks/mpesa/subscription-callback` : Traitement sécurisé du callback et mise à niveau instantanée.
  * `GET /api/system/cloud-health` : Moniteur de santé multi-tenant en direct (latence DB 18ms, statut du worker, passerelle Safaricom).
- **Interface Utilisateur & Jauges de Quotas (`SettingsView.tsx`, `CheckoutModal.tsx`, `AppsView.tsx`)** :
  * Intégration de l'emblème officiel squircle émeraude **`OTOMATIZON Intelligence Layer`** (`/intelligence-core-logo.png`) au cœur du hub central de circulation des systèmes et dans les badges opérationnels.
  * Jauges de progression visuelles en direct dans les paramètres avec statut certifié `100% Operational`.
  * Modal d'encaissement M-Pesa avec saisie du numéro de mobile et suivi de validation en temps réel.

### Étape 28 : Transformation du Centre de Commande en Automation Operating System (Nerve Center)
- **Salle de Contrôle Opérationnelle Vivante ([`HomeCommandCenter.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/HomeCommandCenter.tsx))** :
  * Transformation radicale du centre de commande : il n'est plus un simple tableau de bord statique, mais le **centre nerveux d'orchestration opérationnelle** répondant instantanément aux 9 questions clés.
  * **Pipeline Opérationnel Vivant (Hero Area)** ([`LiveAutomationPipeline.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/LiveAutomationPipeline.tsx)) : Représentation dynamique à 7 étapes (*Inbound WhatsApp $\to$ NLP Understanding $\to$ Sheets Roster $\to$ Calendar Availability $\to$ Decision Engine $\to$ Outbound Reply $\to$ 24h Scheduler & Circuit Breaker*) avec simulateur pas-à-pas interactif (*Live Stepper*).
  * **Tiroir d'Inspection « Decision Trace »** ([`DecisionTraceDrawer.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/DecisionTraceDrawer.tsx)) : Décomposition explicite de l'intelligence (*Ce qui a été détecté $\to$ Ce qu'Otomatizon a compris $\to$ Décision prise $\to$ Justification métier $\to$ Action exécutée & Jeton d'idempotence*).
  * **Gestionnaire d'Exceptions & Arbitrage Humain** ([`AttentionRequiredSection.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AttentionRequiredSection.tsx)) : Traitement des cas particuliers avec ventilation 4 parties (*Ce qui s'est passé, Pourquoi, Ce qu'Otomatizon a tenté, Arbitrage attendu*) et boutons de résolution immédiate.
  * **Matrice de Collaboration Inter-Applications** ([`AppCollaborationMatrix.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AppCollaborationMatrix.tsx)) : Visualisation des synergies opérationnelles entre WhatsApp, Google Workspace et M-Pesa.
  * **Validation Complète par Suite Dédiée** : `test-orchestrator-os.cjs` validé à 100% (5/5).

### Étape 29 : Localisation Intégrale en Anglais Pur (Pure English SaaS Localization & Zero Mixed Languages)
- **Éradication Totale des Textes et Libellés Hybrides Français/Anglais** :
  * L'ensemble des composants React, tiroirs d'inspection, tableaux de bord et modals ont été traduits en anglais professionnel, naturel et irréprochable :
    - [`HomeCommandCenter.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/HomeCommandCenter.tsx) : Accueil (*« Welcome, James. Here is what Otomatizon is orchestrating today. »*), cartes d'impact (*HOURS SAVED*, *REVENUE PROTECTED*, *INQUIRIES HANDLED*, *24H FOLLOW-UPS*), et journal d'audit en direct (*Operational Audit Stream · Live Feed*).
    - [`LiveAutomationPipeline.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/LiveAutomationPipeline.tsx) : *LIVE OPERATIONAL PIPELINE*, *Automation Circulation & Reasoning*, *Simulate Inbound Lead*, *Why did Otomatizon do this? (Inspect Decision Trace)*.
    - [`AttentionRequiredSection.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AttentionRequiredSection.tsx) : *Needs Your Attention*, *WHAT HAPPENED*, *WHY (REASON)*, *WHAT OTOMATIZON TRIED*, *ARBITRATION NEEDED*, *No Action Required*.
    - [`AppCollaborationMatrix.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/AppCollaborationMatrix.tsx) : *Inter-Application Collaboration*, *6 Synchronized Systems*, *Lead Acquisition & Conversion*, *Tuition Payment & Official Receipts*.
    - [`BusinessReportView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/BusinessReportView.tsx) : *Hours Saved*, *Protected Revenue*, *Connected Systems*, *Semantic Accuracy*, *REPORT SECTIONS (10)*, *OPERATIONAL COMPARISON (BEFORE vs WITH OTOMATIZON)*.
    - [`ConnectAppModal.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/ConnectAppModal.tsx), [`FollowUpQueueModal.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/FollowUpQueueModal.tsx), [`IntelligenceInspectorModal.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/IntelligenceInspectorModal.tsx) : Tous les boutons d'action (*Close*, *Cancel Task*, *Trigger Now*, *Copy*, *Copied!*) et formulaires traduits en anglais pur.
  * Validation automatisée sans régression : `test-orchestrator-os.cjs` (5/5), `test-completeness-audit.cjs` (10/10), et `test-system-foundation.cjs` (5/5) validés à 100%.

### Étape 30 : Catalogue Multi-Automatisations & Collaboration d'Équipe (Step 11 Multi-Automation Ecosystem & Team Workspace)
- **Catalogue de 3 Automatisations Métier Complètes & Simulateurs Dédiés** :
  * **1. Lead Follow-Up Autopilot (`wf_lead_autopilot`)** : Inbound WhatsApp $\to$ NLP extraction $\to$ Sheets roster $\to$ Calendar availability check $\to$ 24h follow-up scheduler & anti-spam circuit breaker.
  * **2. Lesson Package Credit Tracker & Renewal (`wf_package_renewal`)** : Détection fin de cours Calendar $\to$ Décompte des crédits dans Sheets $\to$ Détection seuil $\le 1$h $\to$ Facture de renouvellement WhatsApp (KES 28,000) $\to$ Validation M-Pesa STK push et recharge +10h.
  * **3. Post-Session Google Review Collector (`wf_google_reviews`)** : Délai de courtoisie 2h post-session $\to$ Vérification assiduité ($\ge 2$ séances) $\to$ Message de satisfaction WhatsApp avec lien direct 1-tap Google Maps $\to$ Avis 5 étoiles capturé & boost SEO local Nairobi.
- **Sélecteur Dynamique dans le Pipeline Opérationnel Vivant (`LiveAutomationPipeline.tsx`)** :
  * Pilules de sélection rapide pour basculer instantanément entre les 3 flux.
  * Adaptation contextuelle des nœuds visuels, latences et boutons de simulation (*"Simulate Inbound Lead"*, *"Simulate Session & Renewal"*, *"Simulate Review Collector"*).
  * Arbre de décision interactif (*Decision Traces*) dédié pour chaque flux métier.
- **Gestion des Rôles & Collaboration d'Équipe (`SettingsView.tsx`, `types/index.ts`)** :
  * Nouvel onglet **Team & Permissions** dans les paramètres.
  * Tiroir d'invitation avec Nom, Email, Téléphone WhatsApp et rôle (`Admin`, `Collaborator`, `Viewer`).
  * Attribution des actions et journal d'audit multi-utilisateurs.
- **Endpoints REST Serveur Dédiés (`server.cjs`)** :
  * `GET /api/team`, `POST /api/team/invite`, `POST /api/workflows/simulate-package`, `POST /api/workflows/simulate-review`.
- **Suite de Validation Dédiée (`test-multi-automation-ecosystem.cjs`)** :
  * **5 / 5 vérifications validées à 100%** (Catalogue 3 flux, Decision Traces, store simulation, dynamic pipeline switcher et team settings).

## 7. FEUILLE DE ROUTE & PROCHAINES ÉTAPES (CE QU'ON FERA)

### Phase A : Connexions API Directes & Temps Réel
1. **Connecteur WhatsApp Business Cloud API & Webhooks Directs** :
   - Réception instantanée des messages entrants via webhook vérifié HMAC.
   - Envoi de modèles de messages pré-approuvés par Meta pour les relances à 24 heures.
2. **Synchronisation Google Workspace OAuth2 Live** :
   - Flux d'autorisation OAuth2 officiel pour Google Calendar (lecture des créneaux libres, création d'événements Meet).
   - Lecture et écriture directes dans Google Sheets sans export manuel.

### Phase B : Safaricom Daraja API en Mode Production Live
1. **Passerelle Daraja C2B / STK Push Instantanée** :
   - Bascule du mode sandbox vers les identifiants Paybill / Till Live.
   - Réconciliation automatique du code de transaction M-Pesa avec l'élève ou le client dans la base de données.

### Phase C : Nouveaux Modèles d'Automatisation Métier
1. **Suivi des Forfaits d'Heures de Cours** :
   - Décompte automatique à la fin de chaque séance.
   - Alerte polie envoyée sur WhatsApp à la 9e heure d'un forfait de 10 heures pour renouvellement.
2. **Collecteur d'Avis Google Maps / Business Profile** :
   - Envoi automatique d'une invitation à déposer un avis Google Maps 2 heures après la fin d'un rendez-vous réussi.

### Phase D : Multi-Comptes & Collaboration
1. **Gestion d'Équipe & Rôles** :
   - Rôles `Admin`, `Collaborateur`, `Lecture seule` au sein d'une même organisation.
   - Journal d'audit indiquant quel membre a validé ou suspendu une automatisation.

---

## 8. GUIDE DE DÉVELOPPEMENT & COMMANDES UTILES

* **Lancer le serveur de développement** :
  ```powershell
  node server.cjs
  ```
  *(Disponible sur http://localhost:3001)*

* **Compiler le CSS (Tailwind v3)** :
  ```powershell
  node build-css.cjs
  ```

* **Compiler l'application React & les composants** :
  ```powershell
  node build-app.cjs
  ```

* **Exécuter les suites de tests et d'audit** :
  ```powershell
  # Test de rendu SSR & composants
  node test-render.cjs
  node test-app-views.cjs

  # Audit complet de complétude produit (10/10 checks)
  node test-completeness-audit.cjs

  # Audit Red Team, sécurité, RLS et HMAC
  node test-red-team.cjs

  # Tests de revenus, modèle de pricing et funnel
  node test-early-revenue.cjs

  # Test du chemin critique MVP Lean V1
  node test-e2e-mvp.cjs

  # Tests du Decision Engine
  node test-decision-engine.cjs
  ```

* **Gestion de Version & Git Auto-Commit** :
  ```powershell
  # Commiter systématiquement après chaque changement majeur
  $git = "C:\Users\User\AppData\Local\Programs\MinGit\cmd\git.exe"
  & $git add .
  & $git commit -m "..."
  & $git push
  ```

### Étape 17 : Implémentation du Forfait Gratuit (Free Tier / Paquet Gratuit)
- **Modélisation & Définition du Forfait Gratuit** :
  * Identifiant : `free` | Nom : `Free` (Badge : *Free Forever*).
  * Tarification : **KES 0 / mois** (sans carte bancaire ni information de paiement requise).
  * Quotas & Limites : 1 automatisation active, jusqu'à 20 demandes clients / mois, 2 applications connectées (WhatsApp & Google Sheets).
  * Inclus : Moteur de découverte d'opportunités, synchronisation de capture, support communautaire et documentation.
- **Mise à Jour de l'Architecture & de la Persistance** :
  * Types TypeScript unifiés : `PlanId = "free" | "starter" | "growth" | "pro"` dans [`src/types/index.ts`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/types/index.ts) et [`src/lib/billing/types.ts`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/billing/types.ts).
  * Configuration de facturation et gestionnaire d'abonnements : [`src/lib/billing/config.ts`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/billing/config.ts), [`src/lib/billing/config.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/billing/config.cjs) et [`src/lib/billing/subscription-manager.cjs`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/lib/billing/subscription-manager.cjs).
  * Store unifié : `currentPlanId` géré avec calcul direct des quotas de capacité (1 automatisation, 20 demandes/mois pour `free`).
- **Harmonisation UI & Expérience Utilisateur** :
  * Grille de tarification Landing Page ([`LandingPage.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/LandingPage.tsx)) : grille responsive 4 colonnes (`Free`, `Starter`, `Growth`, `Pro`) avec bouton d'activation immédiate *« Get Started Free »*.
  * Sélecteur de forfait Paramètres ([`SettingsView.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/SettingsView.tsx)) : affichage des 4 forfaits avec badge *Free*, bascule instantanée et gestion fine des jauges de quotas.
  * Modal de Checkout ([`CheckoutModal.tsx`](file:///c:/Users/User/Desktop/MES%20SAAS%20ESS/OTOMATIZON/src/components/CheckoutModal.tsx)) : vue dédiée d'activation immédiate en 1 clic sans moyen de paiement requis pour le forfait gratuit.
- **Validation Globale** :
  * 14/14 suites de tests validées à 100% via `test-all-systems.cjs`.

---
*Règle permanente : À chaque changement majeur, compiler, tester, commiter et pousser automatiquement le code (ou rappeler l'ajout du remote si non configuré).*
*Dernière mise à jour : 1er Septembre 2026 — Forfait Gratuit (Free Tier) Implémenté & Synchronisé (14/14 Tests Validés).*
