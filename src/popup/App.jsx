import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../shared/constants.js';

export function App() {
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([
      chrome.storage.sync.get(DEFAULT_SETTINGS),
      chrome.storage.local.get(STORAGE_KEYS.groqApiKey),
    ]).then(([settings, secrets]) => {
      setEnabled(settings[STORAGE_KEYS.enabled]);
      setHasApiKey(Boolean(secrets[STORAGE_KEYS.groqApiKey]));
      setReady(true);
    });
  }, []);
  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    await chrome.storage.sync.set({ [STORAGE_KEYS.enabled]: next });
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
      <p className="notice">
        Your key stays in this browser. Text is sent to Groq only when live translation is enabled.
        Never use a shared production key inside a public extension.
      </p>
    </main>
  );
}
