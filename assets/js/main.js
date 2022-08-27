/*=============== FILTERS TABS ===============*/
const tabs = document.querySelectorAll('[data-target]'),
    tabContents = document.querySelectorAll('[data-content]')

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.target)

        tabContents.forEach(tc => {
            tc.classList.remove('filters__active')
        })
        target.classList.add('filters__active')

        tabs.forEach(t => {
            t.classList.remove('filter-tab-active')
        })
        tab.classList.add('filter-tab-active')
    })
})

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'ri-sun-line'


const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')
let tempV = 0
let tempS = 0
let tempF = 0
    //////////////////////////////////////////////////////////////////////////////////////
let videos = []
let ChannelInfo = []
let videosContiner = document.getElementById('projects')
let CommentsContiner1 = document.getElementById('commentsBox1')
let CommentsContiner1Link = document.getElementById('CommentsBox1Video')
const subsCount = document.getElementById('subsCount')
const viewsCount = document.getElementById('viewsCount')
fetch(`http://185.205.246.144:2423/getVideoInfo`)
    .then((results) => {
        return results.json()
    }).then((data) => {

        const loadCounters = setInterval(() => {

            if (+tempV < data.subs) {
                tempV = tempV + Math.round(data.subs / 500) + 1
                subsCount.textContent = tempV.toLocaleString("en-US").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            } else {
                subsCount.textContent = data.subs.toLocaleString("en-US").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            if (+tempS < data.views) {
                tempS = +tempS + Math.round(data.views / 500) + 1
                viewsCount.textContent = tempS.toLocaleString("en-US").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            } else {
                viewsCount.textContent = data.views.toLocaleString("en-US").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            if (+tempS == data.views && +tempV == data.subs) {
                clearInterval(loadCounters)
            }

        }, 5)

        videosContiner.innerHTML = data.content
        CommentsContiner1Link.textContent = data.comments1INFO.title
        CommentsContiner1Link.href = data.comments1INFO.url
        CommentsContiner1.innerHTML = data.comments1

    })


////////////////////////////////////////////////////////////////////////////






const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line'


if (selectedTheme) {
    document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
    themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme)
}

themeButton.addEventListener('click', () => {

    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400,
})

sr.reveal(`.profile__border`)
sr.reveal(`.profile__name`, { delay: 500 })
sr.reveal(`.profile__profession`, { delay: 600 })
sr.reveal(`.profile__social`, { delay: 700 })
sr.reveal(`.profile__info-group`, { interval: 100, delay: 700 })
sr.reveal(`.profile__buttons`, { delay: 800 })
sr.reveal(`.filters__content`, { delay: 900 })
sr.reveal(`.filters`, { delay: 1000 })