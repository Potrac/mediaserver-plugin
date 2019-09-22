class Control {

    constructor(id, time, container, title = null, symbol = null) {
        this.id = id
        this.title = title
        this.symbol = symbol
        this.time = time
        this.container = container
    }

    setupButtons() {
        this.createButton()
        this.createEffect()
    }

    insert(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    createButton() {
        // Create buttons link
        this.button = document.createElement('a')
        this.button.innerText = this.symbol
        this.button.id = this.id
        this.button.classList.add('PLU_button')
        this.button.href = '#'
        this.button.title = this.title

        // insert in DOM
        this.insert(this.container, this.button)

        return this.button
    }

    createEffect() {
        // Create span elem in DOM for effect
        this.effect = document.createElement('span')
        this.effect.innerText = this.symbol
        this.effect.classList.add('controls')
        this.effect.id = this.id + '_effect'

        this.insert(this.container, this.effect)

        return this.effect
    }

    changeAudioTime() {
        if (this.container.paused) {
            this.container.play()
        }
        this.container.currentTime += this.time

        let _this = this
        _this.effect.classList.add('fade-in')
        setTimeout(function () {
            _this.effect.classList.remove('fade-in')
        }, 800)
    }
}

class Touch extends Control {
    constructor(id, time, container, title, symbol) {
        super(id, time, container, title, symbol)
        this.createTouch()
        super.createEffect()
    }

    createTouch() {
        this.pad = document.createElement('span')
        this.pad.classList.add('touch')
        this.pad.id = this.id
        super.insert(this.container, this.pad)

        this.resizePad()
    }

    resizePad() {
        let h = this.container.offsetHeight
        let w = this.container.offsetWidth

        this.pad.style.height = .8 * h + 'px'
        this.pad.style.width = .6 * w / 2 + 'px'
    }

    positionPadR() {
        this.pad.style.left = .6 * this.container.offsetWidth + 'px'
    }

    positionPadL() {
        this.pad.style.left = .1 * this.container.offsetWidth + 'px'
    }

    changeAudioTime() {
        super.changeAudioTime(this.time)
    }
}

const PLU_audio = (typeof document.getElementsByTagName('audio')[0] == 'undefined') ? document.getElementsByTagName('video')[0] : document.getElementsByTagName('audio')[0]
const PLU_parentNode = document.getElementsByClassName('video-js')[0]

let buttons = []
let but_back_10s = new Control('PLU_bck', -10, PLU_audio, '-10s', '↺')
let but_back_5s = new Control('PLU_bck_5', -5, PLU_audio, '-5s', '↶')
let but_forward_5s = new Control('PLU_fwd_5', 5, PLU_audio, '+5s', '↷')
let but_forward_10s = new Control('PLU_fwd', 10, PLU_audio, '+10s', '↻')
buttons.push(but_back_10s, but_back_5s, but_forward_5s, but_forward_10s)

//Detect click event on buttons
for (let i in buttons) {
    buttons[i].setupButtons()
    buttons[i].button.onclick = function (e) {
        e = e || event
        e.preventDefault ? e.preventDefault() : e.returnValue = false
        buttons[i].changeAudioTime()
    }
}

let pads = []
let padL = new Touch('padL', -5, PLU_audio, '-5s', '↶')
let padR = new Touch('padR', 5, PLU_audio, '+5s', '↷')
pads.push(padL, padR)

function reposition() {
    padR.resizePad()
    padR.positionPadR()
    padL.resizePad()
    padL.positionPadL()
}
reposition()

// onresize performance enhancer
let it
window.onresize = function () {
    clearTimeout(it)
    it = setTimeout(reposition, 400)
}

for (let i in pads) {
    //Detect doubletap
    let lastTap = 0
    let timeout

    pads[i].pad.addEventListener('touchend', function (e) {
        let now = new Date().getTime()
        let elapsed = now - lastTap

        clearTimeout(timeout)

        let time = (i == 0) ? -5 : 5
        if (elapsed < 500 && elapsed > 0) {
            pads[i].changeAudioTime(time)
        }
        lastTap = new Date().getTime()
    })
}

//Keyboard Shortcuts
document.onkeydown = function (e) {
    if (e.shiftKey && e.keyCode == 37) { //shift + left
        but_back_10s.changeAudioTime()
    }
    if (e.shiftKey && e.keyCode == 39) { //shift + right
        but_forward_10s.changeAudioTime()
    }
    if (e.keyCode == '37' && !e.shiftKey) { //left
        but_back_5s.changeAudioTime()
    }
    if (e.keyCode == '39' && !e.shiftKey) { //right
        but_forward_5s.changeAudioTime()
    }
}