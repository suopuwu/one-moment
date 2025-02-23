console.log(window.location)
const settings = Object.freeze({
    disableLength: ['disableLength', 60],
    disableTimer: ['disableTimer', 0],
    urls: ['urls', []],
    duration: ['reflectionLength', 5],
    replaceTitle: ['replaceTitle', true],
    customContent: ['customContent', ''],
    timestamps: ['timers', []],
})

function setSetting(setting, val) {
    let temp = {}
    temp[setting[0]] = val
    return chrome.storage.sync.set(temp)
}
function getSetting(setting) {
    let temp = {}
    temp[setting[0]] = setting[1]
    return chrome.storage.sync.get(temp)
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
    // showCover(cover)
    setTimeout(() => {
        hideCover(cover)
    }, 5000)
})()
