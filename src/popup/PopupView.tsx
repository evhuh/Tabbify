// actual Popup UI component

import { useState } from 'react';
import { useTabStore } from '../store/useTabStore';


export default function PopupView() {
  // const addStack = useTabStore((state) => state.addStack);
  // const activeFolderId = useTabStore((state) => state.activeFolderId);
  const addGlobalStack = useTabStore((state) => state.addGlobalStack);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function saveCurrentWindowAsStack() {
    setSaving(true);
    setMessage('');

    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const activeTab = tabs.find((tab) => tab.active);

      if (!tabs.length || !activeTab) {
        setMessage('No tabs found in current window');
        setSaving(false);
        return;
      }

      const isInGroup = activeTab.groupId !== undefined && activeTab.groupId !== -1;

      let tabsToSave: chrome.tabs.Tab[] = [];
      let relatedNewTabPages: chrome.tabs.Tab[] = [];
      let stackName = 'Untitled Stack';
      let color = '#fcba03';

      if (isInGroup) {
        // CASE 1: Active tab in a Crhome group
        tabsToSave = tabs.filter(
          (tab) =>
            tab.groupId === activeTab.groupId &&
            tab.url &&
            !tab.url.startsWith('chrome://newtab')
        );

        relatedNewTabPages = tabs.filter(
          (tab) => 
            tab.groupId === activeTab.groupId &&
            tab.url?.startsWith('chrome://newtab')
        );

        const group = await chrome.tabGroups.get(activeTab.groupId);
        stackName = group.title || 'Unnamed Group';
        // color = color;  // TODO save chrome group color to be re-opened

      } else {
        // CASE 2: Active tab free-flaoting
        tabsToSave = tabs.filter(
          (tab) =>
            tab.groupId === activeTab.groupId &&
            tab.url &&
            !tab.url.startsWith('chrome://newtab')
        );

        relatedNewTabPages = tabs.filter(
          (tab) => 
            tab.groupId === activeTab.groupId &&
            tab.url?.startsWith('chrome://newtab')
        );
      }
      
      const newStack = {
        id: crypto.randomUUID(),
        name: stackName,
        color,
        pinned: false,
        locked: false,
        tabs: tabsToSave.map((tab) => ({
          id: tab.id?.toString() || crypto.randomUUID(),
          title: tab.title || 'Untitled',
          url: tab.url || '',
        })),
      };

      // add stack
      addGlobalStack(newStack);
    
      // remove tabs
      const allTabsToRemove = [...tabsToSave, ...relatedNewTabPages];
      const tabIdsToRemove = allTabsToRemove
        .map((tab) => tab.id)
        .filter((id): id is number => typeof id === 'number');
    
      // BACKGROUND to remove tabs, then open homepage
      if (tabIdsToRemove.length > 0) {
        await chrome.runtime.sendMessage({
          type: 'REMOVE_TABS_AND_OPEN_HOMEPAGE',
          payload: {tabIds: tabIdsToRemove},
        });
      } else {
        await toggleHomepage();
      }

      setMessage(`Saved '${newStack.name}'`);
    } catch (err) {
      console.error(err);
      setMessage('Error saving stack');
    } finally {
      setSaving(false);
    } 
  }

  return (
    <div className="w-64 p-4 bg-white text-black">
      <h1 className="text-xl font-bold mb-4">Tabbify</h1>
      
      <button
        onClick={saveCurrentWindowAsStack}
        disabled={saving}
        className="bg-green-500 text-white px-4 py-2 rounded mb-2"
      >
        {saving ? 'Saving...' : 'Save Current Window as Stack'}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}

      <button
        onClick={toggleHomepage}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Open Stacklings
      </button>
    </div>
  );
}

async function toggleHomepage() {
  const extensionUrl = chrome.runtime.getURL('/src/home/home.html');
  const allTabs = await chrome.tabs.query({});

  const existingTab = allTabs.find((tab) => tab.url === extensionUrl);

  if (existingTab?.id != null) {
    await chrome.windows.update(existingTab.windowId!, { focused: true });
    await chrome.tabs.update(existingTab.id, { active: true });
  } else {
    // open new tab in curr window
    const currentWindow = await chrome.windows.getCurrent();
    await chrome.tabs.create({ url: extensionUrl, windowId: currentWindow.id });
  }
}

