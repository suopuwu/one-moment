console.log(window.location)
const settings = Object.freeze({
    timers: 'timers',
    disableLength: 'disableLength',
    duration: 'duration',
    urls: 'urls',
    waitPage: 'waitPage',
})

function setSetting(setting, val) {
    let temp = {}
    temp[setting] = val
    return chrome.storage.sync.set(temp)
}
function getSetting(setting) {
    return chrome.storage.sync.get([setting])
}

function createCover() {
    const html = `

    `
    const cover = document.createElement('div')
    cover.innerHTML = html
    cover.classList.add('oneMomentExtensionSuperCoolWrapper')
    document.body.appendChild(cover)
    return cover
}

function showCover(cover) {
    cover.style.display = 'block'
}
function hideCover(cover) {
    cover.style.display = 'none'
}

;(async () => {
    const cover = createCover()
    showCover(cover)
    setTimeout(() => {
        hideCover(cover)
    }, 5000)
})()
