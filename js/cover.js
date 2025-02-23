const settings = Object.freeze({
    disableLength: ['disableLength', 60],
    disableTimer: ['disableTimer', 0],
    urls: ['urls', []],
    reflectionLength: ['reflectionLength', 5],
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
/**
 * TODO:
 * make disabling work
 * make urls work
 * make reflection length work
 * make replace title work
 * make custom content work
 */
class Cover {
    #el
    #urls
    constructor() {
        this.#addHtml()
        this.#init()
    }

    #addHtml() {
        const html = ``
        this.#el = document.createElement('div')
        this.#el.innerHTML = html
        this.#el.classList.add('oneMomentExtensionSuperCoolWrapper')
        document.body.appendChild(this.#el)
    }

    async #init() {
        this.#urls = await getSetting(settings.urls)
        console.log(this.#urls)
    }

    #showCover() {
        this.cover.style.display = 'block'
    }

    #hideCover() {
        cover.style.display = 'none'
    }

    cover() {}
}

function getCurrentUrl() {
    const urlParts = (window.location.host + window.location.href.split(window.location.host)[1]).split('www.')
    return urlParts[urlParts.length - 1]
}

;(async function () {
    const cover = new Cover()
    console.log(getCurrentUrl())
})()
