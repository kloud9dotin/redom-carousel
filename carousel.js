const { el, mount, text, list, setChildren, setStyle, setAttr } = redom

class CarouselSlides {
    constructor(currentUrl) {
        this.currentCard = "card0"
        this.updateCard = "card1"
        this.card0 = el("img.w-100.flex-shrink-0", {src:currentUrl})
        this.card1 = el("img.w-100.flex-shrink-0")
        this.el = el("div.w-100.h-100.flex", this.card0, this.card1)
        setStyle(this.card0, {order: 0, transition:"transform 1s ease-in-out"})
        setStyle(this.card1, {order: 1, transition:"transform 1s ease-in-out"})
    }
    update(updateUrl, direction) {
        if (direction == "right") {
            this.el.classList.remove("justify-end")
            this[this.updateCard].src = updateUrl
            setStyle(this[this.currentCard], {"z-index": -1, order:0, transform:"none", transition:"none"})
            setStyle(this[this.updateCard], {"z-index": 1, order: 1,transform: "translateX(-100%)", transition:"transform 1s ease-in-out"})
        }
        else {
            this.el.classList.add("justify-end")
            this[this.updateCard].src = updateUrl
            setStyle(this[this.currentCard], {"z-index": -1, order: 0, transform:"none", transition:"none"})
            setStyle(this[this.updateCard], {"z-index": 1, order: -1, transform: "translateX(-100%)", transition:"transform 1s ease-in-out"})
            
            setStyle(this[this.updateCard], {transform: "translateX(100%)"})
        }
        document.body.offsetHeight
        this.currentCard = (this.currentCard == "card0" ? "card1" : "card0")
        this.updateCard = (this.currentCard == "card0" ? "card1" : "card0")
    }
}

class Thumbnail {
    constructor(initData) {
        this.notifyParent = initData[0]
        this.index = null
        this.el = el("img.h3.pa1", {onclick: function() {
            this.notifyParent("moveToItem",this.index)
        }.bind(this)})
    }
    update(data, index) {
        this.index = index
        this.el.src = data
    }
}

class Carouselthumbnails {
    constructor(notifyParent) {
        this.el = list(el("div.w-100.h3.pa2.flex.justify-center"), Thumbnail, null, [notifyParent])
    }
    update(data) {
        this.el.update(data)
    }
}

class CarouselContainer {
    constructor(items) {
        this.items = items
        this.length = items.length
        this.currentItem = 0
        this.slides = new CarouselSlides(this.items[0])
        this.totalSlide = el("div.w-100", {onclick:function(e) {
            let width = this.slides.el.getBoundingClientRect().width
            if (e.clientX < 100 ) {
                this.onChildEvent("prevItem")
            }
            else if(e.clientX > width - 100) {
                this.onChildEvent("nextItem")
            }
            return
        }.bind(this)}, this.slides)
        this.thumbnails = new Carouselthumbnails(this.onChildEvent.bind(this))
        this.el = el("div.w-100.h-100", {style:"overflow-x:hidden"}, this.totalSlide, this.thumbnails)
        this.thumbnails.update(this.items)
    }
    update() {

    }
    onChildEvent(type, data) {
        switch(type) {
            case "nextItem":
                if (this.currentItem == this.length - 1) {
                    this.slides.update(this.items[0], "right")
                    this.currentItem = 0
                }
                else {
                    this.slides.update(this.items[this.currentItem + 1], "right")
                    this.currentItem++
                }
                break
            case "prevItem":
                if (this.currentItem == 0) {
                    this.slides.update(this.items[this.length - 1], "left")
                    this.currentItem = this.length - 1
                }
                else {
                    this.slides.update(this.items[this.currentItem - 1], "left")
                    this.currentItem--
                }
                break
            case "moveToItem":
                if (this.currentItem < data ) {
                    this.slides.update(this.items[data], "right")
                    this.currentItem = data
                }
                else if(this.currentItem > data) {
                    this.slides.update(this.items[data], "left")
                    this.currentItem = data
                }
                return
                break
        }
    }
}

let carousel = new CarouselContainer(["img1.jpeg","img2.jpeg","img3.jpeg"])
mount(document.body, carousel)

setStyle(document.body, {margin: 0, padding: 0, width:"100%", height: "100%", "box-sizing": "border-box", "overflow-x": "hidden"})
setStyle(document.documentElement, {margin: 0, padding: 0, width:"100%", height: "100%","box-sizing": "border-box"})