// English (default). Every claim here is checked against the app's code and docs
// (README, docs/, LICENSE, THIRD_PARTY_NOTICES). Keep it that way when editing.
// Strings may hold simple inline HTML (<strong>, <em>, <code>, <a>): they are ours, never user input.

const en = {
  meta: {
    lang: 'en',
    ogLocale: 'en_US',
    title: 'Elyndra — Console-style game launcher for Android',
    description:
      'Elyndra puts your Android games and emulator ROMs in one console-style library, built for gamepads, with Masha, a 3D holographic assistant. Free download for Android 8.0+.',
    privacyTitle: 'Privacy — Elyndra',
    privacyDescription:
      'What the Elyndra app and this website send, to which service, and when. No ads, no analytics, no trackers.',
    notFoundTitle: 'Page not found — Elyndra',
  },
  a11y: {
    skip: 'Skip to content',
    nav: 'Sections',
    langSwitch: 'Language',
    soundOn: 'UI sounds: on',
    soundOff: 'UI sounds: off',
    palette: 'Signature palette',
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
    openImage: 'Open screenshot',
    copy: 'Copy',
    copied: 'Copied',
  },
  nav: {
    features: 'Features',
    masha: 'Masha',
    systems: 'Systems',
    gallery: 'Gallery',
    install: 'Install',
    faq: 'FAQ',
    download: 'Download',
  },
  hero: {
    eyebrow: 'Game launcher for Android',
    title: 'Your games. <span class="grad">One console.</span>',
    lead:
      'Elyndra puts your installed Android games and your emulator ROMs in one library that feels like a console, built for gamepads and touch.',
    cta: 'Download for Android',
    ctaDesktop: 'Get it on your phone',
    secondary: 'Source on GitHub',
    reqs: 'Android 8.0 or later · Free for personal use',
    noJs: 'Opens the GitHub Releases page.',
    shotAlt:
      'Elyndra library in the Meridian layout: a vertical wheel of games on the left and the selected game\'s art on the right',
  },
  pad: {
    connected: 'Controller connected',
    a: 'Select',
    b: 'Back',
    lbrb: 'Section',
    dpad: 'Move',
  },
  features: {
    eyebrow: 'Features',
    title: 'A launcher that plays like a console',
    lead: 'Scroll, use the arrow keys or a controller to turn the wheel.',
    counterLabel: 'Feature {n} of {total}',
    items: [
      {
        id: 'library',
        title: 'One library for everything',
        body:
          'Installed Android games and ROM folders live side by side, with filters (All, Android, Emulators), sorting and search.',
        shot: 'meridian-library',
      },
      {
        id: 'layouts',
        title: 'Meridian and Classic',
        body:
          '<em>Meridian</em> is a vertical wheel with a large hero, in landscape. <em>Classic</em> is a horizontal carousel, always used in portrait and narrow windows.',
        shot: 'settings-appearance',
      },
      {
        id: 'gamepad',
        title: 'Built for gamepads',
        body:
          'The whole app works with a D-pad and sticks: Xbox, PlayStation, Switch Pro, generic and built-in handheld controllers, and TV remotes. Touch works everywhere too.',
        shot: 'meridian-add',
      },
      {
        id: 'emulators',
        title: 'About 130 emulator profiles',
        body:
          'Each ROM goes to the emulator you picked for its folder, with that emulator\'s exact intent, based on ES-DE\'s Android configuration. If it is missing, Elyndra offers to install it or pick another one.',
        shot: 'add-rom-folder',
      },
      {
        id: 'folders',
        title: 'ROM folders, no storage permission',
        body:
          'Folders are added through Android\'s Storage Access Framework. The system is detected from the folder name, and multi-track discs and PS3 folders are grouped correctly.',
        shot: 'add-rom-folder',
      },
      {
        id: 'metadata',
        title: 'Automatic metadata',
        body:
          'Covers, logos, screenshots, descriptions, dates, genres and achievements from ScreenScraper, IGDB, SteamGridDB and RetroAchievements with your own accounts, plus key-less sources: Google Play and Steam store pages and libretro thumbnails. You choose the priority.',
        shot: 'game-details',
      },
      {
        id: 'translate',
        title: 'On-device translation',
        body:
          'Game descriptions are translated on the device with ML Kit. Each language is downloaded once, only when you need it.',
        shot: 'game-details',
      },
      {
        id: 'playtime',
        title: 'Real play time',
        body:
          'With optional usage access, Elyndra counts the time the game was really in the foreground. Without it, from launch until you come back.',
        shot: 'masha',
      },
      {
        id: 'look',
        title: 'Liquid glass, your colors',
        body:
          'Signature palettes, accent colors, selection glow and particles, an animated intro, an optional video or image background, UI sounds and music.',
        shot: 'settings-palettes',
      },
      {
        id: 'widget',
        title: 'Home-screen widget',
        body: 'A home-screen widget with Masha\'s pick for right now, and occasional reminders from her.',
        shot: 'portrait-library',
      },
      {
        id: 'languages',
        title: 'Six languages',
        body: 'English, Spanish, Portuguese, French, German and Japanese, switchable without restarting.',
        shot: 'settings-display',
      },
      {
        id: 'updates',
        title: 'In-app updates',
        body:
          'Elyndra checks GitHub Releases, downloads the right APK for your device, verifies its SHA-256 and opens Android\'s install dialog.',
        shot: 'settings-updates-about',
      },
    ],
  },
  palettes: {
    title: 'Make it yours',
    lead:
      'The app\'s five signature palettes color the focus, the selection glow, the particles and the intro. Try them here: this page follows.',
    names: { plasma: 'Plasma', ember: 'Ember', aurora: 'Aurora', neon_rose: 'Neon Rose', solar: 'Solar' },
  },
  masha: {
    eyebrow: 'Meet Masha',
    title: 'An assistant that knows your library',
    lead:
      'Masha is a 3D holographic avatar with lip-sync and facial expressions, chat and voice input. She lives inside Elyndra.',
    points: [
      { t: 'Picks the best emulator', d: 'For each game, the emulator that runs it best on <em>this</em> device.' },
      { t: 'Remembers how you play', d: 'What you play, how long and how you like it.' },
      { t: 'Reviews your library', d: 'Duplicates, missing discs and odd names.' },
      { t: 'Plans short sessions', d: 'Tell her "I\'ve got 30–40 minutes" and she picks what fits.' },
      {
        t: 'A natural voice on the device',
        d: 'On 64-bit devices, after a one-time download of about 145 MB. Elsewhere, the system text-to-speech voice. The voice is synthetic (AI-generated).',
      },
      {
        t: 'Works offline',
        d: 'With no network or the AI turned off, plans, lists, launches and stats still work from your local data. Only free-form chat needs the online AI.',
      },
    ],
    aiNote:
      'Free-form chat uses DeepSeek. Only titles, systems, play time, device state, Masha\'s memories and the conversation are sent, never file paths, folders, account names or credentials. <a href="{privacy}">Privacy details</a>.',
    load3d: 'Show Masha in 3D',
    loading3d: 'Loading hologram…',
    failed3d: 'The 3D view could not start on this device. Here she is in the app.',
    posterAlt:
      'Masha in the app: a holographic 3D woman inside a ring of light, with play-time cards and chat suggestions',
    canvasLabel: 'Masha, the holographic assistant, rendered in 3D. Drag to turn her.',
    modelNote: 'Web model made from CC0 MakeHuman assets. Animation here is procedural.',
  },
  systems: {
    eyebrow: 'Systems and emulators',
    title: 'Point it at your folders. It knows the rest.',
    lead:
      'Elyndra recognizes {count} systems and about 130 emulator profiles, including RetroArch cores and Windows PC games through Winlator-style runtimes. It <strong>only indexes and launches</strong>: it never emulates anything.',
    groups: {
      nintendo: 'Nintendo',
      sony: 'Sony',
      microsoft: 'Microsoft',
      sega: 'Sega',
      snk: 'SNK',
      nec: 'NEC',
      atari: 'Atari',
      bandai: 'Bandai',
      other: 'Arcade, computers and more',
    },
    disclaimer:
      'Elyndra does not include games, ROMs, BIOS files or emulators. Bring your own legally obtained games and install emulators from their developers. Elyndra is not affiliated with, endorsed or sponsored by any console maker, emulator developer or game publisher. System names are used only to describe compatibility.',
  },
  gallery: {
    eyebrow: 'Gallery',
    title: 'See it running',
    note:
      'Screenshots taken on a Lenovo Legion Y700 tablet. Game names, logos and cover art belong to their owners.',
    items: [
      { shot: 'meridian-library', cap: 'Meridian layout', alt: 'Library in the Meridian layout, with the vertical wheel, the dial and the selected game\'s art' },
      { shot: 'portrait-library', cap: 'Portrait', alt: 'Library in portrait: the hero over the cover carousel', portrait: true },
      { shot: 'intro', cap: 'Animated intro', alt: 'The ELYNDRA intro: the metallic wordmark appears in a burst of golden light' },
      { shot: 'masha', cap: 'Masha', alt: 'Masha, the holographic 3D assistant, with play-time stats and chat suggestions' },
      { shot: 'meridian-add', cap: 'Add to the library', alt: 'Meridian with the Add row selected: an empty stage with orbits of light and the Add games or ROMs button' },
      { shot: 'game-details', cap: 'Game details', alt: 'Game details with description, developer, rating and metadata sources' },
      { shot: 'add-rom-folder', cap: 'Add a ROM folder', alt: 'Add to library: three steps to add a ROM folder (folder, system, emulator)' },
      { shot: 'settings-palettes', cap: 'Signature palettes', alt: 'Appearance settings: signature palettes and accent colors' },
      { shot: 'settings-display', cap: 'Display and theme', alt: 'Display and theme settings in dark mode: intro color, frame rate and Masha smoothness' },
      { shot: 'settings-updates-about', cap: 'Updates and About', alt: 'Settings, About: updates with version, check button and toggles' },
    ],
  },
  download: {
    eyebrow: 'Download',
    title: 'Get Elyndra',
    lead: 'Official builds are published on GitHub Releases. This site never hosts the APK: every button below downloads it straight from GitHub.',
    beta: 'Beta',
    stable: 'Stable',
    version: 'Version',
    published: 'Published',
    size: 'Size',
    file: 'File',
    sha: 'SHA-256',
    shaMissing: 'GitHub did not publish a checksum for this file.',
    button: 'Download APK',
    buttonFor: 'Download for {abi}',
    universal: 'universal, works on every device',
    arm64: 'arm64-v8a, almost every current device',
    otherFiles: 'Other files in this release',
    notes: 'Release notes',
    allReleases: 'All releases on GitHub',
    loading: 'Checking the latest release…',
    fromSnapshot: 'Showing the release list saved when this site was built; GitHub could not be reached just now.',
    failed: 'Could not load the release list. You can download Elyndra from the GitHub Releases page.',
    noRelease: 'No release is published yet. Check the GitHub Releases page.',
    desktopTitle: 'On your phone or tablet',
    desktopBody: 'Scan to open this page on your Android device and download from there.',
    desktopDirect: 'Or download the APK here',
    qrAlt: 'QR code that opens this page',
    detected: 'Picked for your device',
    pickedUniversal: 'We could not tell your device\'s processor, so this is the universal build.',
  },
  install: {
    eyebrow: 'How to install',
    title: 'Three steps, no store needed',
    steps: [
      {
        t: 'Download the APK',
        d: 'Use the button above. <code>…-arm64-v8a.apk</code> fits almost every current phone, tablet and handheld; <code>…-universal.apk</code> works everywhere if you are not sure (it is bigger).',
      },
      {
        t: 'Allow this source',
        d: 'Open the APK. Android asks you to allow installing apps from the app you used to open it (your browser or file manager): turn on <strong>Allow from this source</strong> and go back.',
      },
      {
        t: 'Install',
        d: 'If Google Play Protect asks to scan the app, you can let it scan, or open <strong>More details</strong> to install without scanning.',
      },
    ],
    verifyTitle: 'Verify the download',
    verifyBody:
      'Compare the file\'s SHA-256 with the one shown above (GitHub publishes it for every file). On a computer:',
    verifyAuto: 'The in-app updater does this check for you on every update.',
  },
  updates: {
    eyebrow: 'Updates',
    title: 'Updates come to you',
    body:
      'Elyndra checks GitHub Releases by itself when it opens, at most once a day, and offers new versions with their release notes. Choose <strong>Update</strong> and it downloads the right APK for your device, verifies its SHA-256 checksum and opens Android\'s install dialog.',
    points: [
      'Check by hand or turn the automatic check off in <strong>Settings → About → Updates</strong>.',
      'Beta versions are opt-in.',
      'The check only downloads the public release list from GitHub. No personal data is sent.',
      'New releases show up on this page automatically too: no waiting for the site to be rebuilt.',
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions',
    items: [
      {
        q: 'Is Elyndra free?',
        a: 'Yes. You may download, install and use the official releases free of charge for personal, non-commercial use. See the <a href="https://github.com/jefer02/Elyndra/blob/main/LICENSE">license</a>.',
      },
      {
        q: 'Does it come with games, ROMs, BIOS files or emulators?',
        a: 'No. Elyndra indexes and launches what you already have. ROMs go to the emulator you choose for each folder; install emulators from their developers.',
      },
      {
        q: 'Which devices does it run on?',
        a: 'Android 8.0 (API 26) or later, tested mostly on Android 15. Phones, tablets, handhelds and Android TV boxes with a controller. Masha\'s natural voice needs a 64-bit device.',
      },
      {
        q: 'Do I need a controller?',
        a: 'No. A gamepad is optional: touch works everywhere.',
      },
      {
        q: 'Does it need internet?',
        a: 'Only for metadata, Masha\'s online AI, translations and updates. Everything else works offline.',
      },
      {
        q: 'Why does Android warn me when I install it?',
        a: 'Apps installed from outside a store need your permission once per source app (browser or file manager). That is normal for any APK. Play Protect may also offer to scan it.',
      },
      {
        q: 'Will my library survive an update?',
        a: 'Yes: updates install over the existing app. They only work between builds signed with the same key, so a build you compiled yourself cannot be updated from Releases.',
      },
      {
        q: 'Is it open source?',
        a: 'No. The source code is public on GitHub for reading, but all rights are reserved. Copying, modifying or redistributing it needs written permission. Third-party components keep their own licenses.',
      },
    ],
  },
  privacyTeaser: {
    eyebrow: 'Privacy',
    title: 'No ads, no analytics, no trackers',
    body:
      'Your library, folders and play time stay on your device. Elyndra only goes online for metadata, Masha\'s online AI, translations and updates, and you can turn each of them off.',
    link: 'Read exactly what is sent, and where',
  },
  footer: {
    tagline: 'A console-style game launcher for Android.',
    product: 'Elyndra',
    legal: 'Legal',
    source: 'Source code',
    releases: 'Releases',
    license: 'License',
    notices: 'Third-party notices',
    privacy: 'Privacy',
    author: 'Author',
    credits:
      'Built with the Poppins and Cinzel fonts (SIL OFL 1.1), three.js and uqr (MIT). Masha\'s web model comes from CC0 MakeHuman assets.',
    voice:
      'Masha\'s natural voice uses the Supertonic 3 model weights by Supertone Inc., licensed under the BigScience <a href="https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE">OpenRAIL-M</a> license. The voice is synthetic (AI-generated); by using it you agree not to use it for any of the restricted uses in Attachment A of that license.',
    disclaimer:
      'Elyndra does not include games, ROMs, BIOS files or emulators, and is not affiliated with any console maker, emulator developer or game publisher. All trademarks belong to their owners.',
    copyright: '© 2026 <a href="https://github.com/jefer02">Jeferson Manuel Morillo Vallejo</a>. All rights reserved.',
  },
  privacy: {
    title: 'Privacy',
    updated: 'Last updated: October 8, 2026',
    intro:
      'This page explains what the Elyndra app and this website send over the network, to whom and when. Elyndra has no accounts of its own, no ads, no analytics and no trackers.',
    appTitle: 'The Elyndra app',
    localTitle: 'What stays on your device',
    local:
      'Your library, ROM folders, play time, settings, Masha\'s memories and her conversation are stored on your device. Service accounts and keys you enter are encrypted with a key from the Android Keystore. App backups are turned off.',
    servicesTitle: 'Services the app talks to',
    servicesLead: 'Each one is used only for the feature in its row. Their content belongs to their owners.',
    thService: 'Service',
    thWhen: 'When',
    thWhat: 'What is sent',
    services: [
      {
        s: 'ScreenScraper',
        w: 'Metadata for ROMs, if you add your account',
        d: 'The ROM\'s file name, size and checksums (CRC, MD5, SHA-1), its system, and your ScreenScraper account.',
      },
      {
        s: 'IGDB (Twitch), SteamGridDB',
        w: 'Metadata and art, if you add your account',
        d: 'Game titles to search for, and your keys for those services.',
      },
      {
        s: 'RetroAchievements',
        w: 'Achievements, if you add your account',
        d: 'Game identifiers or ROM hashes, and your RetroAchievements user name and key.',
      },
      {
        s: 'Google Play and Steam store pages, libretro thumbnails',
        w: 'Key-less metadata, if those sources are on',
        d: 'Game titles or Android package names, as part of the page or image address. No account.',
      },
      {
        s: 'DeepSeek',
        w: 'Masha\'s free-form chat, when the AI is on',
        d: 'Titles, systems, play time, device state, Masha\'s memories and the conversation. Never file paths, folders, account names or credentials.',
      },
      {
        s: 'Hugging Face',
        w: 'Once, if you turn on Masha\'s natural voice',
        d: 'A plain download of the voice model (about 145 MB). Nothing about you.',
      },
      {
        s: 'Google ML Kit',
        w: 'When you translate descriptions',
        d: 'Downloads the language model once. The translation itself runs on the device.',
      },
      {
        s: 'GitHub',
        w: 'Update check, at most once a day (can be turned off)',
        d: 'A request for the public release list, and the APK when you choose to update. No personal or device data.',
      },
    ],
    permsTitle: 'Permissions',
    perms: [
      '<strong>Microphone</strong>: only when you talk to Masha. Speech is recognized by your device\'s speech service (for example Google\'s), under that service\'s own privacy terms.',
      '<strong>Usage access</strong> (optional): measures exact play time. You turn it on in the system settings, from Settings → Masha.',
      '<strong>Folders</strong>: you pick each ROM folder through Android\'s file picker. Elyndra has no storage permission.',
      '<strong>Install apps</strong>: lets the updater open Android\'s install dialog. Android asks you the first time.',
      '<strong>Notifications</strong>: metadata progress and Masha\'s reminders.',
    ],
    controlTitle: 'You are in control',
    control: [
      'Masha\'s online AI can be turned off in Settings → Masha. She keeps working offline.',
      '"Forget everything Masha knows" deletes her memories, conversation and cache.',
      'Each metadata source can be switched off, and the automatic update check too.',
    ],
    siteTitle: 'This website',
    site: [
      'No cookies, no analytics, no trackers, no third-party fonts or scripts.',
      'To show the latest version, your browser asks the public GitHub API for Elyndra\'s release list (api.github.com). GitHub receives that request like any web request, under <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement">GitHub\'s privacy statement</a>.',
      'Downloads come straight from GitHub Releases. This site does not host the APK.',
      'The site is served by Cloudflare, which processes requests to deliver it.',
      'Your browser keeps a few preferences on your device only: language, palette, sound, and a short-lived copy of the release list.',
    ],
    contactTitle: 'Questions',
    contact: 'Open an issue at <a href="https://github.com/jefer02/Elyndra/issues">github.com/jefer02/Elyndra</a> or contact the author at <a href="https://github.com/jefer02">github.com/jefer02</a>.',
    back: 'Back to the home page',
  },
  notFound: {
    title: 'Lost signal',
    body: 'This page does not exist. The library is this way.',
    home: 'Go to the home page',
  },
  runtime: {
    mb: 'MB',
  },
};

type Widen<T> = T extends string
  ? string
  : T extends boolean
    ? boolean
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : { [K in keyof T]: Widen<T[K]> };

export type Dict = Widen<typeof en>;
export default en as Dict;
