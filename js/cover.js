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
let usedUrl
const originalTitle = document.title
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

async function getTimestamp() {
    const timestamps = await getSetting(settings.timestamps)
    for (const timestamp of timestamps) {
        if (timestamp.url == usedUrl) {
            return timestamp.time
        }
    }
    return 0
}

async function setTimestamp(length) {
    const timestamps = await getSetting(settings.timestamps)
    let found = -1
    for (const [i, timestamp] of timestamps.entries()) {
        if (timestamp.url == usedUrl) {
            found = i
        }
    }
    let newVal = { url: usedUrl, time: Date.now() + length }
    if (found == -1) timestamps.push(newVal)
    else timestamps[found] = { url: usedUrl, time: Date.now() + length }
    await setSetting(settings.timestamps, timestamps)
}

async function getReflection() {
    const reflections = await getSetting(settings.customReflections)
    const prunedReflections = []
    for (let reflection of reflections) {
        if (reflection.substring(0, 2) == '//') continue
        if (reflection == '') continue
        prunedReflections.push(reflection)
    }

    if (prunedReflections.length == 0) return 'Is it worth it?'
    return prunedReflections[Math.floor(Math.random() * prunedReflections.length)]
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\/\]\\]/g, '\\$&') // $& means the whole matched string
}

function msToHMS(ms) {
    let seconds = ms / 1000
    const hours = parseInt(seconds / 3600) // 3,600 seconds in 1 hour
    seconds = seconds % 3600 // seconds remaining after extracting hours
    const minutes = parseInt(seconds / 60) // 60 seconds in 1 minute
    seconds = Math.floor(seconds % 60)
    return { h: hours, m: minutes, s: seconds }
}

async function changeTitle(timestamp) {
    if (!(await getSetting(settings.replaceTitle))) return
    const remaining = msToHMS(timestamp - Date.now())
    document.title = `${remaining.h > 0 ? remaining.h + ':' : ''}${remaining.m}:${remaining.s} | ${originalTitle}`
}

class Cover {
    #el
    #continueButton
    #countdown
    #reflection
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
        await this.#addHtml()

        this.#doCountdown()
        if (!(await this.#browseIfBeforeTime())) {
            chrome.storage.onChanged.addListener(async () => {
                await this.#browseIfBeforeTime()
            })
        }
    }

    async #browseIfBeforeTime() {
        if ((await getTimestamp()) > Date.now()) {
            await this.#doBrowsingLoop()
            return true
        } else return false
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
            usedUrl = selector
            selector = escapeRegExp(selector)
            selector = selector.replaceAll('<<', '.*')
            selector = '^' + selector + '$'
            let regex = RegExp(`^${selector}$`, 'i')
            if (regex.test(current)) return true
        }

        return false
    }
    async #addHtml() {
        const html = `
            <div class="oneMomentReflection">
                <span id="currentOneMomentReflection">${await getReflection()}</span>
                <h1 class="oneMomentCountDown">${await getSetting(settings.reflectionLength)}</h1>
            </div>
            <span></span>
            <span></span>
            <div id="oneMomentExtensionButtons"">
                <span id="${this.#ids.quick}" class="oneMomentButton${(await getSetting(settings.quickLength)) == 0 ? ' displayNone' : ''}">Quick check</span>
                <span id="${this.#ids.continue}" class="oneMomentButton hidden">Continue</span>
            </div>
        `
        this.#el = document.createElement('div')
        this.#el.innerHTML = html
        this.#el.classList.add('oneMomentExtensionSuperCoolWrapper')
        this.#countdown = this.#el.querySelector('.oneMomentCountDown')
        this.#reflection = this.#el.querySelector('.oneMomentReflection')

        document.body.appendChild(this.#el)
        this.#el.addEventListener('click', async (e) => {
            switch (e.target.id) {
                case this.#ids.quick:
                    this.#continue(await getSetting(settings.quickLength))
                    break
                case this.#ids.continue:
                    this.#continue(await getSetting(settings.normalLength))
                    break
            }
        })
    }

    async #continue(length) {
        const lengthMs = Math.round(length * 60 * 1000)
        await setTimestamp(lengthMs)
        this.#doBrowsingLoop()
    }

    async #doBrowsingLoop() {
        // chrome.storage.onChanged.removeListener(async () => {
        //     this.#browseIfBeforeTime
        // })
        this.#hideCover()
        let timestamp = await getTimestamp()
        changeTitle(timestamp)
        while (timestamp > Date.now()) {
            changeTitle(timestamp)
            timestamp = await getTimestamp()
            await new Promise((r) => setTimeout(r, 1000))
        }
        document.title = originalTitle
        this.#showCover()
    }

    async #doCountdown() {
        let currentCount = Number(this.#countdown.innerText)
        this.#reflection.style.setProperty('--animation-count', currentCount + 1)
        while (currentCount > 1) {
            await new Promise((r) => setTimeout(r, 1000))
            currentCount--
            this.#countdown.innerText = currentCount
        }
        await new Promise((r) => setTimeout(r, 1000))
        this.#countdown.innerText = 0
        this.#showContinue()
    }

    #showContinue() {
        if (!this.#continueButton) this.#continueButton = this.#el.querySelector(`#${this.#ids.continue}`)
        this.#continueButton.classList.remove('hidden')
    }
    #hideContinue() {
        if (!this.#continueButton) this.#continueButton = this.#el.querySelector(`#${this.#ids.continue}`)
        this.#continueButton.classList.add('hidden')
    }

    async #showCover() {
        this.#hideContinue()
        this.#countdown.innerText = await getSetting(settings.reflectionLength)
        this.#el.classList.remove('displayNone')
        this.#doCountdown()
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
//TODO make regex work within urls
//todo add theming and light mode capabilities
;(async function () {
    const cover = new Cover()
})()
