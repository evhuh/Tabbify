
chrome.runtime.onMessage.addListener(async (message, _sender, _sendResponse) => {

    // src/popup/PopupView.tsx call to when creating Stack
    if (message.type === 'REMOVE_TABS_AND_OPEN_HOMEPAGE') {
        let { tabIds } = message.payload;
        console.log('received tabIds:', tabIds);
        if (!tabIds || (Array.isArray(tabIds) && tabIds.length === 0)) {
            console.warn('no valid tabs to remove.');
            return;
        }

        const extensionUrl = chrome.runtime.getURL('/src/home/home.html');

        const allWindows = await chrome.windows.getAll({ populate: true });

        // ct num windows that have tabs
        const normalWindows = allWindows.filter(
        (w) =>
            w.type === 'normal' &&
            w.tabs &&
            w.tabs.some((t) => t.url && !t.url.startsWith('chrome://'))
        );
        const isLastWindow = normalWindows.length <= 1;

        // find (if) existing homepage tab in any window
        const existingHomeTab = allWindows
            .flatMap((w) => w.tabs || [])
            .find((tab) => tab.url === extensionUrl && tab.id !== undefined);

        let homeTabId: number | null = null;

        // 0a. homepage alr in another window
        if (existingHomeTab) {
            homeTabId = existingHomeTab.id!;
            await chrome.windows.update(existingHomeTab.windowId!, { focused: true });
            await chrome.tabs.update(existingHomeTab.id!, { active: true });
        }
        // 0b. check if is last window
        else if (isLastWindow) {
            const currentWindow = await chrome.windows.getCurrent();
            const homeTab = await chrome.tabs.create({
                url: extensionUrl,
                windowId: currentWindow.id,
                active: true,
            });
            homeTabId = homeTab.id ?? null;
        }
        // filter out removing home tab
        if (homeTabId !== null) {
            tabIds = tabIds.filter((id: number) => id !== homeTabId);
        }
        
        // 1. removet abs
        if (tabIds.length > 0) {
            try {
            await new Promise<void>((resolve, reject) => {
                chrome.tabs.remove(tabIds, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            } catch (error) {
                console.error('error removing tabs:', error);
                return; 
            }
        }

        // 2. open homepage after removing tabs
        if (!homeTabId) {
            const allTabs = await chrome.tabs.query({});
            const existingTab = allTabs.find((tab) => tab.url === extensionUrl);

            if (existingTab && existingTab.id !== undefined) {
                await chrome.windows.update(existingTab.windowId!, { focused: true });
                await chrome.tabs.update(existingTab.id, { active: true });
            } else {
                const currentWindow = await chrome.windows.getCurrent();
                await chrome.tabs.create({ url: extensionUrl, windowId: currentWindow.id });
            }
        }
    }

});
