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
    elems.disableLength.value = await getStorage(storage.disableLength)
    elems.urls.innerHTML = (await getStorage(storage.urls)).join('<br>')
    elems.reflectionLength.value = await getStorage(storage.reflectionLength)
    elems.normalLength.value = await getStorage(storage.normalLength)
    elems.quickLength.value = await getStorage(storage.quickLength)
    elems.replaceTitle.checked = await getStorage(storage.replaceTitle)
    elems.customReflections.innerHTML = (await getStorage(storage.customReflections)).join('<br>')
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
        await setStorage(storage.disableLength, val)
        saved()
    })
    elems.urls.addEventListener('input', async (e) => {
        let val = e.target.innerText.split('\n')
        if (JSON.stringify(val) == '["",""]') {
            e.target.innerHTML = ''
            val = []
        }
        await setStorage(storage.urls, val)
        saved()
    })
    elems.customReflections.addEventListener('input', async (e) => {
        let val = e.target.innerText.split('\n')
        if (JSON.stringify(val) == '["",""]') {
            console.log(e.target)
            e.target.innerHTML = ''
            val = []
        }
        await setStorage(storage.customReflections, val)
        saved()
    })
    elems.reflectionLength.addEventListener('input', async (e) => {
        let val = e.target.value == '' ? 1 : e.target.value
        await setStorage(storage.reflectionLength, val)
        saved()
    })
    elems.normalLength.addEventListener('input', async (e) => {
        let val = e.target.value == '' ? 1 : e.target.value
        await setStorage(storage.normalLength, val)
        saved()
    })
    elems.quickLength.addEventListener('input', async (e) => {
        let val = e.target.value == '' ? 0 : e.target.value
        await setStorage(storage.quickLength, val)
        saved()
    })
    elems.replaceTitle.addEventListener('input', async (e) => {
        await setStorage(storage.replaceTitle, e.target.checked)
        saved()
    })

    elems.disable.addEventListener('click', async () => {
        const timestamps = await getStorage(storage.timestamps)
        const disableLength = (await getStorage(storage.disableLength)) * 60 * 1000
        console.log(timestamps)
        const newTimestamps = []
        const urls = await getStorage(storage.urls)
        for (let selector of urls) {
            if (selector.substring(0, 2) == '//') continue
            if (selector == '') continue
            newTimestamps.push({ url: selector, time: Date.now() + disableLength })
        }
        await setStorage(storage.timestamps, newTimestamps)
    })
})
