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
/**
 * TODO:
 * make disabling work
 * make urls work
 * make reflection length work
 * make replace title work
 * make custom content work
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\/\]\\]/g, '\\$&') // $& means the whole matched string
}

class Cover {
    #el
    #buttons
    #ids = {
        continue: 'continueOneMoment',
        quick: 'quickOneMoment',
        buttons: 'oneMomentExtensionButtons',
    }
    constructor() {
        this.#init()
    }

    async #init() {
        if (!(await this.#urlMatches())) return
        this.#addHtml()
        // setTimeout(() => {
        //     this.#hideCover()
        // }, (await getSetting(settings.reflectionLength)) * 1000)
    }

    //gets the current url without www. or https:// or http://
    #getCurrentUrl() {
        const urlParts = (window.location.host + window.location.href.split(window.location.host)[1]).split('www.')
        return urlParts[urlParts.length - 1]
    }

    async #urlMatches() {
        const current = this.#getCurrentUrl()
        const urls = await getSetting(settings.urls)
        for (let selector of urls) {
            if (selector.substring(0, 2) == '//') continue
            if (selector == '') continue
            selector = escapeRegExp(selector)
            selector = selector.replaceAll('<<', '.*')
            selector = '^' + selector + '$'
            let regex = RegExp(`^${selector}$`, 'i')
            if (regex.test(current)) return true
        }

        return false
    }
    //todo make customizable reflections
    #addHtml() {
        const html = `
            <div class="oneMomentReflection">
                Is this necessary?
                <h1 class="oneMomentCountDown">10</h1>
            </div>
            <span></span>
            <span></span>
            <div id="oneMomentExtensionButtons" class="hidden">
                <span id="${this.#ids.quick}" class="oneMomentButton">Quick check</span>
                <span id="${this.#ids.continue}" class="oneMomentButton">Continue</span>
            </div>
        `
        this.#el = document.createElement('div')
        this.#el.innerHTML = html
        this.#el.classList.add('oneMomentExtensionSuperCoolWrapper')
        document.body.appendChild(this.#el)
        this.#el.addEventListener('click', (e) => {
            switch (e.target.id) {
                case this.#ids.quick:
                    this.#hideButtons()
                    setTimeout(() => {
                        this.#showButtons()
                    }, 1000)
                    break
                case this.#ids.continue:
                    this.#hideCover()
                    setTimeout(() => {
                        this.#showCover()
                    }, 1000)
                    break
            }
        })
    }

    #showButtons() {
        if (!this.#buttons) this.#buttons = this.#el.querySelector(`#${this.#ids.buttons}`)
        this.#buttons.classList.remove('hidden')
    }
    #hideButtons() {
        if (!this.#buttons) this.#buttons = this.#el.querySelector(`#${this.#ids.buttons}`)
        this.#buttons.classList.add('hidden')
    }

    #showCover() {
        this.#el.classList.remove('displayNone')
        setTimeout(() => {
            this.#el.classList.remove('hidden')
        }, 1)
    }

    #hideCover() {
        this.#el.classList.add('hidden')
        setTimeout(() => {
            this.#el.classList.add('displayNone')
        }, 200)
    }

    cover() {}
}

;(async function () {
    const cover = new Cover()
})()
