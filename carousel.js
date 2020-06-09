const { el, mount, text, list, setChildren, setStyle, setAttr } = redom

class CarouselSlides {
    constructor(currentUrl) {
        this.currentCard = "card0"
        this.updateCard = "card1"
        this.card0 = el("img.w-100.flex-shrink-0", {style:"height:auto",src:currentUrl})
        this.card1 = el("img.w-100.flex-shrink-0", {style:"height:auto"})
        this.el = el("div.w-100.flex", this.card0, this.card1)
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
            this.notifyParent(this.index)
        }.bind(this)})
    }
    update(data, index, items,context) {
        this.index = index
        this.el.src = data
        if (context.currentIndex == this.index) setStyle(this.el, {border:"2px solid red"})
        else setStyle(this.el, {border:"none"})
    }
}

class Carouselthumbnails {
    constructor(isVertical, isThumnailFirst,notifyParent) {
        this.notifyParent = notifyParent
        this.el = list(el("div.flex.absolute.z-5" + (isVertical ? ".w-100" + (isThumnailFirst ? ".top-0" : ".bottom-0") :".w10.flex-column"+ (isThumnailFirst ? ".left-0" : ".right-0")),{ style:"overflow-x:scroll;background:#202027;"}), Thumbnail, null, [this.onChildEvent.bind(this)])
    }
    update(data, currentIndex) {
        this.el.update(data, {currentIndex: currentIndex})
    }
    onChildEvent(index) {
        this.notifyParent("moveToItem",index)
    }
}

class CarouselContainer {
    constructor(options) {
        this.isVertical = options.isVertical
        this.isThumnailFirst = options.isThumnailFirst
        this.items = options.items
        this.length = this.items.length
        this.autoPlayPeriod = options.autoPlayPeriod || 5000
        this.currentItem = 0
        this.thumbnailVisibile = false
        this.lastUpdateTime = (new Date()).getTime()
        this.slides = new CarouselSlides(this.items[0])
        this.totalSlide = el("div.w-100.flex-grow", {style:"overflow-x:hidden", onclick:function(e) {
            let width = this.slides.el.getBoundingClientRect().width
            if (e.clientX < width *0.25 ) {
                this.onChildEvent("prevItem")
            }
            else if(e.clientX > width * 0.75) {
                this.onChildEvent("nextItem")
            }
            else {
                this.onChildEvent("togglingThumbnail")
            }
            return
        }.bind(this)}, this.slides)
        this.thumbnails = new Carouselthumbnails(this.isVertical, this.isThumnailFirst, this.onChildEvent.bind(this))
        this.el = el("div.w-100.flex.relative" + (this.isVertical ? ".flex-column": ""), {style:"overflow-x:hidden"}, this.totalSlide, this.thumbnails)
        this.thumbnails.update(this.items, this.currentItem)
        this.isVertical ? setStyle(this.thumbnails.el, {"max-height":"0px", transition:"max-height 1s ease-in-out"}) : setStyle(this.thumbnails.el, {"max-width":"0px", transition:"max-width 1s ease-in-out"})
        this.autoPlay = function() {
            if(new Date().getTime() -this.lastUpdateTime > this.autoPlayPeriod ) {
                this.onChildEvent("nextItem")
                if (this.thumbnailVisibile) this.thumbnails.update(this.items, this.currentItem)
                this.lastUpdateTime = new Date().getTime()
            }
            requestAnimationFrame(this.autoPlay)
        }.bind(this)
        requestAnimationFrame(this.autoPlay)
        new ResizeObserver(function() {if(!this.isVertical) setStyle(this.thumbnails, {height: this.totalSlide.getBoundingClientRect().height + "px"})}.bind(this)).observe(this.totalSlide)
    }
    onChildEvent(type, data) {
        this.lastUpdateTime = new Date().getTime()
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
                }
                else if(this.currentItem > data) {
                    this.slides.update(this.items[data], "left")
                }
                this.currentItem = data
                this.isVertical ? setStyle(this.thumbnails.el, {"max-height":"0px", transition:"max-height 1s ease-in-out 1s"}) : setStyle(this.thumbnails.el, {"max-width":"0px", transition:"max-width 1s ease-in-out 1s"})
                this.thumbnailVisibile = !this.thumbnailVisibile
                break
            case "togglingThumbnail":
                    if (this.thumbnailVisibile) {
                        this.isVertical ? setStyle(this.thumbnails.el, {"max-height":"0px", transition:"max-height 1s ease-in-out"}) : setStyle(this.thumbnails.el, {"max-width":"0px", transition:"max-width 1s ease-in-out"})
                    }
                    else {
                        this.isVertical ? setStyle(this.thumbnails.el, {"max-height":"500px", transition:"max-height 1s ease-in-out"}) : setStyle(this.thumbnails.el, {"max-width":"5000px", transition:"max-width 1s ease-in-out"})
                        this.thumbnails.update(this.items, this.currentItem)
                        if(!this.isVertical) setStyle(this.thumbnails, {height: this.totalSlide.getBoundingClientRect().height + "px"})
                    }
                    this.thumbnailVisibile = !this.thumbnailVisibile
                break
        }
        return
    }
}

let options = { isVertical: Math.random() > 0.5,
                isThumnailFirst: Math.random() > 0.5,
                autoPlayPeriod: 5000,
                items:["img1.jpeg","img2.jpeg","img3.jpeg","img2.jpeg","img3.jpeg","img2.jpeg","img3.jpeg","img2.jpeg","img3.jpeg","img2.jpeg","img3.jpeg","img2.jpeg","img3.jpeg"]}
let carousel = new CarouselContainer(options)
mount(document.body, carousel)

setStyle(document.body, {margin: 0, padding: 0, width:"100%", height: "100%", "box-sizing": "border-box", "overflow-x": "hidden"})
setStyle(document.documentElement, {margin: 0, padding: 0, width:"100%", height: "100%","box-sizing": "border-box"})