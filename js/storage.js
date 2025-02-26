const storage = Object.freeze({
    disableLength: ['disableLength', 60],
    urls: ['urls', []],
    reflectionLength: ['reflectionLength', 5],
    quickLength: ['quickLength', 1],
    normalLength: ['normalLength', 10],
    replaceTitle: ['replaceTitle', true],
    customReflections: ['customReflections', []],
    timestamps: ['timestamps', []],
    counts: ['counts', []], // [{ url, date, count }]
})

async function setStorage(setting, val) {
    let temp = {}
    temp[setting[0]] = val
    return await chrome.storage.sync.set(temp)
}
async function getStorage(setting) {
    let temp = {}
    temp[setting[0]] = setting[1]
    return (await chrome.storage.sync.get(temp))[setting[0]]
}
