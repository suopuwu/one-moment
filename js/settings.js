//I would make this an export to avoid duplication, but it doesn't seem possible to make content scripts modules, so I wouldn't be able to import these into cover.js
const settings = Object.freeze({
    disableLength: ['disableLength', 60],
    urls: ['urls', []],
    reflectionLength: ['reflectionLength', 5],
    quickLength: ['quickLength', 1],
    normalLength: ['normalLength', 10],
    replaceTitle: ['replaceTitle', true],
    customReflections: ['customReflections', []],
    timestamps: ['timestamps', []],
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
        normalLength: document.querySelector('#normalLength'),
        quickLength: document.querySelector('#quickLength'),
        replaceTitle: document.querySelector('#replaceTitle'),
        customReflections: document.querySelector('#customReflections'),
        saveIndicator: document.querySelector('#saveIndicator'),
    })

    //fill data
    elems.disableLength.value = await getSetting(settings.disableLength)
    elems.urls.innerHTML = (await getSetting(settings.urls)).join('<br>')
    elems.reflectionLength.value = await getSetting(settings.reflectionLength)
    elems.normalLength.value = await getSetting(settings.normalLength)
    elems.quickLength.value = await getSetting(settings.quickLength)
    elems.replaceTitle.checked = await getSetting(settings.replaceTitle)
    elems.customReflections.innerHTML = (await getSetting(settings.customReflections)).join('<br>')
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
    elems.customReflections.addEventListener('input', async (e) => {
        let val = e.target.innerText.split('\n')
        if (JSON.stringify(val) == '["",""]') {
            console.log(e.target)
            e.target.innerHTML = ''
            val = []
        }
        await setSetting(settings.customReflections, val)
        saved()
    })
    elems.reflectionLength.addEventListener('input', async (e) => {
        let val = e.target.value == '' ? 1 : e.target.value
        await setSetting(settings.reflectionLength, val)
        saved()
    })
    elems.normalLength.addEventListener('input', async (e) => {
        let val = e.target.value == '' ? 1 : e.target.value
        await setSetting(settings.normalLength, val)
        saved()
    })
    elems.quickLength.addEventListener('input', async (e) => {
        let val = e.target.value == '' ? 0 : e.target.value
        await setSetting(settings.quickLength, val)
        saved()
    })
    elems.replaceTitle.addEventListener('input', async (e) => {
        await setSetting(settings.replaceTitle, e.target.checked)
        saved()
    })

    elems.disable.addEventListener('click', async () => {
        const timestamps = await getSetting(settings.timestamps)
        const disableLength = (await getSetting(settings.disableLength)) * 60 * 1000
        console.log(timestamps)
        const newTimestamps = []
        const urls = await getSetting(settings.urls)
        for (let selector of urls) {
            if (selector.substring(0, 2) == '//') continue
            if (selector == '') continue
            newTimestamps.push({ url: selector, time: Date.now() + disableLength })
        }
        await setSetting(settings.timestamps, newTimestamps)
    })
})
