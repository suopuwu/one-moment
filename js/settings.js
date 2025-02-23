//I would make this an export to avoid duplication, but it doesn't seem possible to make content scripts modules, so I wouldn't be able to import these into cover.js
const settings = Object.freeze({
    disableLength: ['disableLength', 60],
    disableTimer: ['disableTimer', 0],
    urls: ['urls', []],
    reflectionLength: ['reflectionLength', 5],
    quickLength: ['quickLength', 1],
    replaceTitle: ['replaceTitle', true],
    customContent: ['customContent', ''],
    timestamps: ['timers', []],
})

async function setSetting(setting, val) {
    let temp = {}
    temp[setting[0]] = val
    return await chrome.storage.sync.set(temp)
}
async function getSetting(setting) {
    let temp = {}
    temp[setting[0]] = setting[1]
    return (await chrome.storage.sync.get(temp))[setting[0]]
}

document.addEventListener('DOMContentLoaded', async () => {
    //select all interactables
    const elems = Object.freeze({
        disable: document.querySelector('#disable'),
        disableLength: document.querySelector('#disableLength'),
        urls: document.querySelector('#urls'),
        reflectionLength: document.querySelector('#reflectionLength'),
        quickLength: document.querySelector('#quickLength'),
        replaceTitle: document.querySelector('#replaceTitle'),
        customContent: document.querySelector('#customContent'),
        saveIndicator: document.querySelector('#saveIndicator'),
    })

    //fill data
    elems.disableLength.value = await getSetting(settings.disableLength)
    elems.urls.innerHTML = (await getSetting(settings.urls)).join('<br>')
    elems.reflectionLength.value = await getSetting(settings.reflectionLength)
    elems.quickLength.value = await getSetting(settings.quickLength)
    elems.replaceTitle.checked = await getSetting(settings.replaceTitle)
    elems.customContent.value = await getSetting(settings.customContent)

    function saved() {
        elems.saveIndicator.textContent += 'saved'
    }

    //add event listeners
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault()
            saved()
        }
    })

    elems.disableLength.addEventListener('input', async (e) => {
        let val = e.target.value == '' ? 1 : e.target.value
        await setSetting(settings.disableLength, val)
        saved()
    })
    elems.urls.addEventListener('input', async (e) => {
        let val = e.target.innerText.split('\n')
        if (JSON.stringify(val) == '["",""]') {
            e.target.innerHTML = ''
            val = []
        }
        await setSetting(settings.urls, val)
        saved()
    })
    elems.reflectionLength.addEventListener('input', async (e) => {
        let val = e.target.value == '' ? 1 : e.target.value
        await setSetting(settings.reflectionLength, val)
        saved()
    })
    elems.quickLength.addEventListener('input', async (e) => {
        let val = e.target.value == '' ? 1 : e.target.value
        await setSetting(settings.quickLength, val)
        saved()
    })
    elems.replaceTitle.addEventListener('input', async (e) => {
        await setSetting(settings.replaceTitle, e.target.checked)
        saved()
    })
    elems.customContent.addEventListener('input', async (e) => {
        await setSetting(settings.customContent, e.target.value)
        saved()
    })
})
