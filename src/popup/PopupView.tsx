// actual Popup UI component

export default function PopupView() {
  return (
    <div className="w-64 p-4 bg-white text-black">
      <h1 className="text-xl font-bold mb-4">Tabbify</h1>
      <button
        onClick={openOrFocusHomePage}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Open Stacklings
      </button>
    </div>
  );
}

function openOrFocusHomePage() {
  const extensionUrl = chrome.runtime.getURL('/src/home/home.html');

  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find((tab) => tab.url === extensionUrl);
    if (existingTab && existingTab.id !== undefined) {
      chrome.tabs.update(existingTab.id, { active: true });
    } else {
      chrome.tabs.create({ url: extensionUrl });
    }
  });
}

