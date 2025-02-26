let usedUrl //The url matching pattern that was used for the current page
const originalTitle = document.title

async function getCount() {
    const today = new Date().toDateString()
    const defaultCount = { date: today, count: 0, url: usedUrl }
    let count = findByUrl(await getStorage(storage.counts))[1] ?? defaultCount
    console.log(count)
    console.log(today)
    if (count.date != today) {
        count = defaultCount
        setOrCreateIfNonexistentByUrl(storage.counts, defaultCount)
    }
    return findByUrl(await getStorage(storage.counts))[1]?.count ?? 0
}

async function getTimestamp() {
    return findByUrl(await getStorage(storage.timestamps))[1]?.time ?? 0
}

function findByUrl(list) {
    for (const [i, val] of list.entries()) {
        if (val.url == usedUrl) {
            return [i, val]
        }
    }
    return [-1, null]
}

async function setTimestamp(length) {
    await setOrCreateIfNonexistentByUrl(storage.timestamps, { url: usedUrl, time: Date.now() + length })
}
async function incrementCount(amount) {
    const currentCount = await getCount()
    await setOrCreateIfNonexistentByUrl(storage.counts, { url: usedUrl, date: new Date().toDateString(), count: currentCount + amount })
    return currentCount + amount
}

async function setOrCreateIfNonexistentByUrl(storageCategory, newVal) {
    const list = await getStorage(storageCategory)
    let [found] = findByUrl(list)
    if (found == -1) list.push(newVal)
    else list[found] = newVal
    await setStorage(storageCategory, list)
}

async function getReflection() {
    const reflections = await getStorage(storage.customReflections)
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
    if (!(await getStorage(storage.replaceTitle))) return
    const remaining = msToHMS(timestamp - Date.now())
    document.title = `${remaining.h > 0 ? remaining.h + ':' : ''}${remaining.m}:${remaining.s} | ${originalTitle}`
}

async function createReflectionHtml() {
    const count = await getCount()
    return `${await getReflection()}<br>${count} open${count == 1 ? '' : 's'} today`
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
        const urls = await getStorage(storage.urls)
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
                <span id="currentOneMomentReflection">${await createReflectionHtml()}</span>
                <h1 class="oneMomentCountDown">${await getStorage(storage.reflectionLength)}</h1>
            </div>
            <span></span>
            <span></span>
            <div id="oneMomentExtensionButtons"">
                <span id="${this.#ids.quick}" class="oneMomentButton${(await getStorage(storage.quickLength)) == 0 ? ' displayNone' : ''}">Quick check</span>
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
                    this.#continue(await getStorage(storage.quickLength))
                    break
                case this.#ids.continue:
                    this.#continue(await getStorage(storage.normalLength))
                    break
            }
        })
    }

    async #continue(length) {
        const lengthMs = Math.round(length * 60 * 1000)
        const normalLength = await getStorage(storage.normalLength)
        //This is bad practice, if you have time, make it not retrieve from storage so much.
        await setTimestamp(lengthMs)
        const newCount = await incrementCount(+(Math.round(length / normalLength + 'e+2') + 'e-2'))
        this.#el.querySelector('#currentOneMomentReflection').innerHTML = await createReflectionHtml()
        this.#doBrowsingLoop()
    }

    async #doBrowsingLoop() {
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
        this.#countdown.innerText = await getStorage(storage.reflectionLength)
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
//TODO add theming and light mode capabilities
//TODO create ball bouncing on stairs animation
//TODO look into making the changed title work with certain websites like twitter
//TODO make the time formatter correctly add leading zeroes to the time
//TODO clean up and organize code where possible
//TODO make the settings layout responsive so it looks good in both page and popup forms
;(async function () {
    const cover = new Cover()
})()
