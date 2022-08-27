const app = require("express")();
const Port = 2423
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const d = new Date()
const dotenv = require('dotenv');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
dotenv.config()
const coldown = 900 * 1000
app.listen(
    Port,
    () => {
        console.log(`live on http://185.205.246.144:${Port}/`)
    }
)

app.get('/getVideoInfo', async(req, res) => {
    res.header('Access-Control-Allow-Origin', "*");
    // res.header('Access-Control-Allow-Methods', 'POST');
    res.header("Access-Control-Allow-Headers", "accept, content-type");
    res.header("Access-Control-Max-Age", "1728000");

    if (await db.get('lastCheck')) {
        let lastCheck = await db.get('lastCheck')

        if ((new Date().getTime() - +lastCheck) > coldown) {

            await db.set('lastCheck', new Date().getTime())
            console.log('you can now')
            await getInformation()
            await getVideos()
            await getComments()
            let subs = await db.get('subs')
            let views = await db.get('views')
            let Content = await db.get('Videos')
            let Comments1 = await db.get('commentsCollector1')
            res.status(200).send({
                'subs': subs,
                'views': views,
                'content': Content,
                'comments1': Comments1.comments1,
                'comments1INFO': Comments1.comments1INFO
            })
        } else {
            console.log(`please wait for ${ (coldown / 1000) - (Math.round((new Date().getTime() - +lastCheck) / 1000)) } second`)


            let subs = await db.get('subs')
            let views = await db.get('views')
            let Content = await db.get('Videos')
            let Comments1 = await db.get('commentsCollector1')
            res.status(200).send({
                'subs': subs,
                'views': views,
                'content': Content,
                'comments1': Comments1.comments1,
                'comments1INFO': Comments1.comments1INFO
            })
        }


    } else {
        await db.set('lastCheck', new Date().getTime())
        res.status(404).send({
            'message': 'not found'
        })
    }


})

async function getComments() {
    if (await db.get('VideosIDs')) {
        let VideoID = JSON.parse(await db.get('VideosIDs'))
        let ran = Math.floor(Math.random() * 10);
        await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?key=${process.env.secret}&textFormat=plainText&part=snippet&videoId=${VideoID[ran]}&maxResults=50`)
            .then((results) => {
                return results.json()
            }).then(async(data) => {
                let commentsCollector = { comments1: ``, comments1INFO: `` }
                await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${VideoID[ran]}&key=${process.env.secret}`)
                    .then((res) => {
                        return res.json()
                    }).then(async(res) => {
                        commentsCollector.comments1INFO = {
                            title: res.items[0].snippet.title,
                            url: `https://www.youtube.com/watch?v=${VideoID[ran]}`
                        }
                    })

                let NamesCollector = []
                for (let i = 0; i < 5; i++) {
                    let ran = Math.floor(Math.random() * 50) + 1;
                    let comment = data.items[ran].snippet.topLevelComment.snippet.textOriginal
                    let author = data.items[ran].snippet.topLevelComment.snippet.authorDisplayName
                    console.log(comment.length + '\n' + comment)
                    if (comment.length > 3 || !NamesCollector.includes(author)) {
                        NamesCollector.push(author)
                        let authorImgUrl = data.items[ran].snippet.topLevelComment.snippet.authorProfileImageUrl
                        let likeCount = data.items[ran].snippet.topLevelComment.snippet.likeCount
                        let date = data.items[ran].snippet.topLevelComment.snippet.publishedAt.split('T')[0]
                        commentsCollector.comments1 += ` <div class="commentBox">
                    <div class="mainBox">
                        <div class="imagebox">
                            <img src="${authorImgUrl}">
                        </div>

                        <div class="commentContent">
                            <h2 class="author">${author}</h2>
                            <h5 class="Content">${comment}</h5>
                        </div>
                    </div>

                    <div class="details">
                        <h4>${likeCount} <i class="ri-thumb-up-fill"></i> </h4>
                        <h4>${date} <i class="ri-calendar-2-line"></i></h4>
                    </div>
                </div>`

                    } else {
                        i--
                    }


                }
                await db.set('commentsCollector1', commentsCollector)
            })
    }

}

async function getInformation() {
    await fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=UCx1PfeJMTOoryYBmZUDDNyw&key=${process.env.secret}`)
        .then((results) => {
            return results.json()
        }).then((data) => {
            let ChannelInfo = data.items
            db.set('subs', ChannelInfo[0].statistics.subscriberCount)
            db.set('views', ChannelInfo[0].statistics.viewCount)
        })
}

async function getVideos() {
    await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=UCx1PfeJMTOoryYBmZUDDNyw&maxResults=10&order=date&key=${process.env.secret}`)
        .then((results) => {
            return results.json()
        }).then(async(data) => {
            let videosContiner = ``
            videos = data.items
            let VideosIds = []
            for (video of videos) {
                VideosIds.push(video.id.videoId)
                await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${video.id.videoId}&key=${process.env.secret}`)
                    .then((res) => {
                        return res.json()
                    }).then(async(Items) => {

                        videosContiner += `<article class="projects__card">
            <img src="${video.snippet.thumbnails.high.url}" alt="" class="projects__img">
            <div class="projects__modal">
                <div class="projects__flex">
                    <div class="buttons">
                        <div class="pro_btn"> ${Items.items[0].statistics.likeCount.toLocaleString("en-US").replace(/\B(?=(\d{3})+(?!\d))/g, ",")} <i class="ri-thumb-up-fill"></i></div>
                        <div class="pro_btn"> ${Items.items[0].statistics.viewCount.toLocaleString("en-US").replace(/\B(?=(\d{3})+(?!\d))/g, ",")} <i class="ri-eye-line"></i></div>
                    </div>
                    <div class="playBox">
                        <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank" class="projects__button button button__small">
                            <i class="ri-play-line"></i>
                        </a>
                    </div>
                    <div class="details">
                        <span class="projects__subtitle">${video.snippet.publishedAt.split('T')[0]}</span>
                        <h3 class="projects__title">${video.snippet.title}</h3>
                    </div>
                </div>
            </div>
        </article>`
                    })


            }

            db.set('VideosIDs', JSON.stringify(VideosIds))
            db.set('Videos', videosContiner)
        })
}


const { Client } = require('discord.js-selfbot-v13');
const { TextChannel } = require('discord.js-selfbot-v13');

const client = new Client();

let levelCh = '1013106214600712213'

client.on('ready', async() => {
    client.user.setStatus('invisible')
    console.log(`${client.user.username} is ready!`);

    try {
        setInterval(() => {
            client.channels.cache.get(levelCh).send(`biggest wiggle
    biggest wiggle
    biggest wiggle
    biggest wiggle
    biggest wiggle
       biggest wiggle
          biggest wiggle
             biggest wiggle
                 biggest wiggle
                      biggest wiggle
                         biggest wiggle
                            biggest wiggle
                               biggest wiggle
                                  biggest wiggle
                                    biggest wiggle
                                      biggest wiggle
                                        biggest wiggle
                                         biggest wiggle
                                          biggest wiggle
                                           biggest wiggle
                                           biggest wiggle
                                           biggest wiggle
                                           biggest wiggle
                                          biggest wiggle
                                         biggest wiggle
                                        biggest wiggle
                                      biggest wiggle
                                    biggest wiggle
                                  biggest wiggle
                               biggest wiggle
                            biggest wiggle
                         biggest wiggle
                      biggest wiggle
                   biggest wiggle
                biggest wiggle
             biggest wiggle
          biggest wiggle
        biggest wiggle
    biggest wiggle
    biggest wiggle
    biggest wiggle`)

        }, 3000)
    } catch (err) {
        console.log(err.message)
    }
})

client.login(process.env.token);