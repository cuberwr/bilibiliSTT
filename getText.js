const fetch = require('node-fetch')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const sdk = require("microsoft-cognitiveservices-speech-sdk")
const stt=require('./stt')

const checkData = {
    "headers": {
        "user-agent": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"92\"",
        "referer": "https://www.bilibili.com"
        //"cookie": "_uuid=F26CEA46-DA77-2A0E-062E-1E238FAF3DDF70062infoc; buvid3=97E4CD24-CF22-4529-A11E-0061CDE963EA18563infoc; sid=k0b0o3fq; buvid_fp=97E4CD24-CF22-4529-A11E-0061CDE963EA18563infoc; DedeUserID=4990540; DedeUserID__ckMd5=9a644ff979f287a2; SESSDATA=ad9a2ea1%2C1630839749%2C45080*31; bili_jct=5db6465802ddc02228b0287a94419453; CURRENT_FNVAL=80; blackside_state=1; rpdid=|(um~kmum~R~0J'uYulk)~~~m; fingerprint3=1850309f16e98e062b852ac6f0021f61; fingerprint_s=e5b3919bd02c64744f24acd0a8f28873; LIVE_BUVID=AUTO2216241982873555; fingerprint=279675c9346adc999713a4c37dfcdb20; buvid_fp_plain=944D33E1-A950-42D5-85D5-D7350CD3297553948infoc; CURRENT_QUALITY=116; route=; CURRENT_BLACKGAP=1; bp_t_offset_4990540=556956438230181435; PVID=1; bsource=share_source_copy_link; bp_video_offset_4990540=559155689118487865; innersign=1"
    }
}

async function getCid(bv) {
    let res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bv}`)
    res = await res.json()
    if (res.code) return res.message
    return res.data.cid
}

async function getAAC(bv) {
    let cid = await getCid(bv)
    let res = await fetch(`http://api.bilibili.com/x/player/playurl?bvid=${bv}&cid=${cid}&fnval=16`)
    res = await res.json()
    let url = res.data.dash.audio[0].baseUrl
    console.log(url)
    let AAC = await fetch(url, checkData)
    AAC = await AAC.buffer()
    fs.writeFileSync(bv + '.aac', AAC, "binary")
    return bv + '.aac'
}

async function aac2wav(aacfile) {
    ffmpeg(aacfile).save(aacfile + '.wav').on('end', () => {
        console.log('save as ', aacfile + '.wav')
    })
    return aacfile + '.wav'
}

async function outText(bv) {
    let aac = await getAAC(bv)
    let wav = await aac2wav(aac)
    await stt(wav,'test.txt')
}

outText('BV17v411377S')