import { useEffect, useState } from 'react';
import {
  COMMANDS,
  DEFAULT_SETTINGS,
  MESSAGE_TYPES,
  SITE_MODES,
  STORAGE_KEYS,
  TRANSLATION_MODES,
} from '../shared/constants.js';
import { getSiteMode, updateSiteMode } from '../shared/siteSettings.js';
import {
  DEFAULT_STYLE_PREFERENCES,
  normalizeProtectedTerms,
  normalizeStylePreferences,
} from '../shared/preferences.js';
import { createUserDataExport } from '../shared/userData.js';

async function getActiveSiteContext() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) return null;
  return chrome.tabs.sendMessage(tab.id, { type: MESSAGE_TYPES.getSiteContext }).catch(() => null);
}

export function App() {
  const [enabled, setEnabled] = useState(true);
  const [translationMode, setTranslationMode] = useState(TRANSLATION_MODES.automatic);
  const [siteOrigin, setSiteOrigin] = useState(null);
  const [siteModes, setSiteModes] = useState({});
  const [currentSiteMode, setCurrentSiteMode] = useState(SITE_MODES.global);
  const [shortcut, setShortcut] = useState('Not assigned');
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState('');
  const [protectedTermsText, setProtectedTermsText] = useState('');
  const [vocabularyStatus, setVocabularyStatus] = useState('');
  const [stylePreferences, setStylePreferences] = useState(DEFAULT_STYLE_PREFERENCES);
  const [dataStatus, setDataStatus] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([
      chrome.storage.sync.get(DEFAULT_SETTINGS),
      chrome.storage.local.get([
        STORAGE_KEYS.groqApiKey,
        STORAGE_KEYS.protectedTerms,
        STORAGE_KEYS.stylePreferences,
      ]),
      chrome.commands.getAll(),
      getActiveSiteContext(),
    ]).then(([settings, secrets, commands, siteContext]) => {
      setEnabled(settings[STORAGE_KEYS.enabled]);
      setTranslationMode(settings[STORAGE_KEYS.translationMode]);
      setSiteModes(settings[STORAGE_KEYS.siteModes]);
      setSiteOrigin(siteContext?.origin ?? null);
      setCurrentSiteMode(getSiteMode(settings[STORAGE_KEYS.siteModes], siteContext?.origin));
      setHasApiKey(Boolean(secrets[STORAGE_KEYS.groqApiKey]));
      setProtectedTermsText(
        normalizeProtectedTerms(secrets[STORAGE_KEYS.protectedTerms]).join('\n'),
      );
      setStylePreferences(normalizeStylePreferences(secrets[STORAGE_KEYS.stylePreferences]));
      const command = commands.find((item) => item.name === COMMANDS.translateFocusedEditor);
      if (command?.shortcut) setShortcut(command.shortcut);
      setReady(true);
    });
  }, []);
  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    await chrome.storage.sync.set({ [STORAGE_KEYS.enabled]: next });
  };
  const chooseTranslationMode = async (mode) => {
    setTranslationMode(mode);
    await chrome.storage.sync.set({ [STORAGE_KEYS.translationMode]: mode });
  };
  const chooseSiteMode = async (mode) => {
    const next = updateSiteMode(siteModes, siteOrigin, mode);
    setSiteModes(next);
    setCurrentSiteMode(mode);
    await chrome.storage.sync.set({ [STORAGE_KEYS.siteModes]: next });
  };
  const openShortcutSettings = () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  };
  const saveApiKey = async (event) => {
    event.preventDefault();
    const key = apiKey.trim();
    if (!key) {
      setKeyStatus('Enter an API key first.');
      return;
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.groqApiKey]: key });
    setApiKey('');
    setHasApiKey(true);
    setKeyStatus('API key saved on this browser.');
  };
  const removeApiKey = async () => {
    await chrome.storage.local.remove(STORAGE_KEYS.groqApiKey);
    setApiKey('');
    setHasApiKey(false);
    setKeyStatus('API key removed.');
  };
  const saveProtectedTerms = async (event) => {
    event.preventDefault();
    const terms = normalizeProtectedTerms(protectedTermsText);
    await chrome.storage.local.set({ [STORAGE_KEYS.protectedTerms]: terms });
    setProtectedTermsText(terms.join('\n'));
    setVocabularyStatus(
      `${terms.length} protected ${terms.length === 1 ? 'term' : 'terms'} saved.`,
    );
  };
  const clearProtectedTerms = async () => {
    await chrome.storage.local.remove(STORAGE_KEYS.protectedTerms);
    setProtectedTermsText('');
    setVocabularyStatus('Protected vocabulary cleared.');
  };
  const chooseStylePreference = async (name, value) => {
    const next = normalizeStylePreferences({ ...stylePreferences, [name]: value });
    setStylePreferences(next);
    await chrome.storage.local.set({ [STORAGE_KEYS.stylePreferences]: next });
  };
  const exportUserData = () => {
    const payload = createUserDataExport({
      syncSettings: {
        [STORAGE_KEYS.enabled]: enabled,
        [STORAGE_KEYS.translationMode]: translationMode,
        [STORAGE_KEYS.siteModes]: siteModes,
      },
      protectedTerms: protectedTermsText,
      stylePreferences,
    });
    const url = URL.createObjectURL(
      new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'tonebridge-settings.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setDataStatus('Settings exported without your API key.');
  };
  const deleteUserData = async () => {
    if (!window.confirm('Delete the API key, vocabulary, style, site rules, and preferences?'))
      return;
    await Promise.all([
      chrome.storage.local.remove([
        STORAGE_KEYS.groqApiKey,
        STORAGE_KEYS.protectedTerms,
        STORAGE_KEYS.stylePreferences,
      ]),
      chrome.storage.sync.set(DEFAULT_SETTINGS),
    ]);
    setEnabled(DEFAULT_SETTINGS[STORAGE_KEYS.enabled]);
    setTranslationMode(DEFAULT_SETTINGS[STORAGE_KEYS.translationMode]);
    setSiteModes(DEFAULT_SETTINGS[STORAGE_KEYS.siteModes]);
    setCurrentSiteMode(SITE_MODES.global);
    setHasApiKey(false);
    setApiKey('');
    setProtectedTermsText('');
    setStylePreferences(DEFAULT_STYLE_PREFERENCES);
    setDataStatus('All ToneBridge user data was deleted from this browser.');
  };
  return (
    <main>
      <section className="brand">
        <span>T</span>
        <div>
          <h1>ToneBridge</h1>
          <p>Same meaning. Same tone. Natural English.</p>
        </div>
      </section>
      <button className="toggle-row" type="button" onClick={toggle} disabled={!ready}>
        <span>
          <strong>Writing assistant</strong>
          <small>{enabled ? 'Enabled on supported websites' : 'Paused'}</small>
        </span>
        <i className={enabled ? 'on' : ''} aria-hidden="true">
          <b />
        </i>
      </button>
      <section className="mode-settings" aria-labelledby="translation-trigger-heading">
        <div className="section-heading">
          <span>
            <strong id="translation-trigger-heading">Translation trigger</strong>
            <small>Choose when text may be sent for translation</small>
          </span>
        </div>
        <div className="mode-options">
          <button
            className={translationMode === TRANSLATION_MODES.automatic ? 'selected' : ''}
            type="button"
            onClick={() => chooseTranslationMode(TRANSLATION_MODES.automatic)}
            disabled={!ready}
            aria-pressed={translationMode === TRANSLATION_MODES.automatic}
          >
            <strong>Automatic</strong>
            <small>After a short typing pause</small>
          </button>
          <button
            className={translationMode === TRANSLATION_MODES.manual ? 'selected' : ''}
            type="button"
            onClick={() => chooseTranslationMode(TRANSLATION_MODES.manual)}
            disabled={!ready}
            aria-pressed={translationMode === TRANSLATION_MODES.manual}
          >
            <strong>Manual</strong>
            <small>Only when you use the shortcut</small>
          </button>
        </div>
        <div className="shortcut-row">
          <span>
            Focused editor shortcut <kbd>{shortcut}</kbd>
          </span>
          <button type="button" onClick={openShortcutSettings}>
            Change
          </button>
        </div>
      </section>
      <section className="site-settings" aria-labelledby="site-settings-heading">
        <div className="section-heading">
          <span>
            <strong id="site-settings-heading">This site</strong>
            <small>{siteOrigin ? new URL(siteOrigin).hostname : 'Unavailable on this page'}</small>
          </span>
        </div>
        <label htmlFor="site-mode">Translation behavior</label>
        <select
          id="site-mode"
          value={currentSiteMode}
          onChange={(event) => chooseSiteMode(event.target.value)}
          disabled={!ready || !siteOrigin}
        >
          <option value={SITE_MODES.global}>Use global ({translationMode})</option>
          <option value={SITE_MODES.automatic}>Automatic</option>
          <option value={SITE_MODES.manual}>Manual only</option>
          <option value={SITE_MODES.disabled}>Disabled</option>
        </select>
        <p>
          {currentSiteMode === SITE_MODES.disabled
            ? 'ToneBridge will not read or translate editor text on this site.'
            : currentSiteMode === SITE_MODES.manual
              ? 'Typing sends nothing. Use the focused editor shortcut to translate.'
              : currentSiteMode === SITE_MODES.automatic
                ? 'Translate after a short typing pause on this site.'
                : `This site follows the global ${translationMode} mode.`}
        </p>
      </section>
      <form className="vocabulary-settings" onSubmit={saveProtectedTerms}>
        <div className="section-heading">
          <span>
            <strong>Protected vocabulary</strong>
            <small>Names, brands, versions, and technical terms</small>
          </span>
        </div>
        <label htmlFor="protected-terms">One exact term per line</label>
        <textarea
          id="protected-terms"
          rows="4"
          value={protectedTermsText}
          onChange={(event) => setProtectedTermsText(event.target.value)}
          placeholder={'ToneBridge\nReact 19\nSaiful Alam Fahim'}
          spellCheck="false"
        />
        <div className="form-actions">
          <button type="submit">Save terms</button>
          {protectedTermsText && (
            <button type="button" className="secondary" onClick={clearProtectedTerms}>
              Clear
            </button>
          )}
        </div>
        {vocabularyStatus && (
          <p className="key-status" role="status">
            {vocabularyStatus}
          </p>
        )}
      </form>
      <section className="style-settings" aria-labelledby="style-settings-heading">
        <div className="section-heading">
          <span>
            <strong id="style-settings-heading">English style</strong>
            <small>Explicit preferences only; ToneBridge does not learn from messages</small>
          </span>
        </div>
        <label htmlFor="spelling-style">Spelling</label>
        <select
          id="spelling-style"
          value={stylePreferences.spelling}
          onChange={(event) => chooseStylePreference('spelling', event.target.value)}
        >
          <option value="automatic">Automatic</option>
          <option value="american">American English</option>
          <option value="british">British English</option>
        </select>
        <label htmlFor="contraction-style">Contractions</label>
        <select
          id="contraction-style"
          value={stylePreferences.contractions}
          onChange={(event) => chooseStylePreference('contractions', event.target.value)}
        >
          <option value="automatic">Automatic</option>
          <option value="prefer">Prefer contractions</option>
          <option value="avoid">Avoid contractions</option>
        </select>
      </section>
      <form className="api-settings" onSubmit={saveApiKey}>
        <div className="section-heading">
          <span>
            <strong>Groq API</strong>
            <small>{hasApiKey ? 'Ready for live translation' : 'API key required'}</small>
          </span>
          <em className={hasApiKey ? 'connected' : ''}>
            {hasApiKey ? 'Connected' : 'Offline demo'}
          </em>
        </div>
        <label htmlFor="groq-key">Free Groq API key</label>
        <input
          id="groq-key"
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder={hasApiKey ? 'Saved — enter a new key to replace' : 'gsk_…'}
          autoComplete="off"
          spellCheck="false"
        />
        <div className="form-actions">
          <button type="submit">Save key</button>
          {hasApiKey && (
            <button type="button" className="secondary" onClick={removeApiKey}>
              Remove
            </button>
          )}
          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
            Get a free key
          </a>
        </div>
        {keyStatus && (
          <p className="key-status" role="status">
            {keyStatus}
          </p>
        )}
      </form>
      <section className="data-settings" aria-labelledby="data-settings-heading">
        <div className="section-heading">
          <span>
            <strong id="data-settings-heading">Your data</strong>
            <small>Export settings or delete everything stored by ToneBridge</small>
          </span>
        </div>
        <div className="form-actions">
          <button type="button" onClick={exportUserData}>
            Export settings
          </button>
          <button type="button" className="danger" onClick={deleteUserData}>
            Delete all data
          </button>
        </div>
        {dataStatus && (
          <p className="key-status" role="status">
            {dataStatus}
          </p>
        )}
      </section>
      <p className="notice">
        Your key, vocabulary, and style preferences stay in this browser. Automatic mode sends text
        after a typing pause; Manual mode sends it only when you use the shortcut. Never use a
        shared production key inside a public extension.
      </p>
    </main>
  );
}
