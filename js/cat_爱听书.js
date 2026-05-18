let key = 'itingshu';
let HOST = 'https://api.itingshu.iiisss.top';
let UA = 'Mozilla/5.0 (Linux; Android 12; SM-A5260 Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 Safari/537.36 uni-app (Immersed/24.0)';

const commonHeaders = {
    'User-Agent': UA,
    'x-Requested-With': 'com.itingshu.hearbook',
    'Accept': 'application/json',
    'Connection': 'Keep-Alive',
    'sign': 'LoINXn9uoGHQNY+BtYmF6hJhcQasDZoRq2/vcE6PCsI=',
    'Cookie': 'server_name_session=6f5501ce60c46452b21bc47efb3d25f2'
};

async function request(url) {
    let res = await req(url, {
        method: 'GET',
        headers: commonHeaders
    });
    return JSON.parse(res.content || res);
}

async function init(cfg) {
    console.log("爱听书初始化...");
}

async function home(filter) {
    let url = `${HOST}/api/itingshu/catlist?platform=qq`;
    let data = await request(url);

    let classList = [];
    let filters = {};

    let cats = data?.sub?.catlist || [];
    cats.forEach(it => {
        let tid = it.value.toString();
        if (tid !== "0") {
            classList.push({
                type_id: tid,
                type_name: it.text
            });
        }
    });

    let sortOptions = (data?.sub?.toplist || []).map(it => ({
        n: it.text,
        v: it.value.toString()
    }));

    let statusOptions = (data?.sub?.isover || []).map(it => ({
        n: it.text,
        v: it.value.toString()
    }));

    classList.forEach(cls => {
        filters[cls.type_id] = [
            {
                key: "orderid",
                name: "排序",
                value: sortOptions
            },
            {
                key: "isover",
                name: "状态",
                value: statusOptions.length > 0 ? statusOptions : [
                    { n: "全部", v: "0" },
                    { n: "连载", v: "1" },
                    { n: "完结", v: "2" }
                ]
            }
        ];
    });

    return JSON.stringify({
        class: classList,
        filters: filters
    });
}

async function homeVod() {
    let url = `${HOST}/api/itingshu/categorylist?id=1&limit=15`;
    let data = await request(url);
    let list = data.playlists.map(it => ({
        vod_id: it.novel.id,
        vod_name: it.novel.name,
        vod_pic: it.novel.covers,
        vod_remarks: it.boyinname
    }));
    return JSON.stringify({ list });
}

async function category(tid, pg, filter, extend) {
    let orderid = extend.orderid || "1";
    let isover = extend.isover || "0";
    
    let url = `${HOST}/api/itingshu/categorylist?id=${tid}&offset=${pg}&limit=20&orderid=${orderid}&isover=${isover}`;
    
    let data = await request(url);
    let videos = data.playlists.map(it => ({
        vod_id: it.novel.id,
        vod_name: it.novel.name,
        vod_pic: it.novel.covers,
        vod_remarks: it.boyinname
    }));
    return JSON.stringify({ page: pg, list: videos });
}

async function detail(id) {
    let infoUrl = `${HOST}/api/itingshu/bookinfo?id=${id}`;
    let info = await request(infoUrl);
    
    let dirUrl = `https://api.mmm.iiisss.top/api/itingshu/bookdirst?id=${id}`;
    let dir = await request(dirUrl);
    
    let vod = {
        vod_id: id,
        vod_name: info.playlist.name,
        vod_pic: info.playlist.coverImgUrl,
        type_name: info.playlist.category.name,
        vod_actor: info.playlist.boyin[0].name,
        vod_content: info.playlist.description,
        vod_play_from: '爱听书',
        vod_play_url: dir.list.map(it => `${it.name}$${it.id}`).join('#')
    };
    
    return JSON.stringify({ list: [vod] });
}

async function play(flag, id, flags) {
    const time = "1775643087";
    const token = "b45cf5094bc9a519f8ad597ba34384d0";
    const encrypted = "3nrlMoFhUCqS/pJKD0OdWnpJYVLoITDZfMLAVtCBlz5/xiam0UarmiRIblvNlnQT0dqxCV1wzTjE7/YBwNeQkM/qkwrEl+rJ5X+q8ZeXZ9jh7+Fb97PJAbVmbwMjbbRBys8QI5fjcGA9u/Q5r84WX0eU3rvxtn4/YD1r/HF1SC2EotyDe5zOTZIO0ewFM3vKGOy8nsl7N4S8ufuEfMSDTWP6SCuhDEV4k2jX7CGdNybE3vLKfe7qjoRq//6dVbyuXDJGO1pOgEIEP3WrSmYSsGe5fHbf9mBFUF/ewEri4yhJwi6DDQj7WVo73OZomZfYutYZiHd1Ur5Cm8LzL0gLTJkNkNguPOWde8pmaAMFaaykZKadsTg/vBWdDUcgzTp+YmFPiAe9NksLZpVq13zYvg==";

    let playApi = `${HOST}/api/itingshu/audio?id=${id}&platform=qq&time=${time}&token=${token}&encrypted=${encodeURIComponent(encrypted)}&appVersion=2.6.5`;
    
    let data = await request(playApi);
    let playUrl = (data.code === 200 && data.data) ? data.data.src : "";

    return JSON.stringify({
        parse: 0,
        url: playUrl,
        header: commonHeaders
    });
}

async function search(wd, quick) {
    let url = `${HOST}/api/itingshu/cloudsearch?key=${encodeURIComponent(wd)}&type=1&limit=20`;
    let data = await request(url);
    let videos = (data.data || []).map(it => ({
        vod_id: it.novel.id,
        vod_name: it.novel.name,
        vod_pic: it.novel.cover,
        vod_remarks: it.boyin ? it.boyin[0].name : ''
    }));
    return JSON.stringify({ list: videos });
}

export function __jsEvalReturn() {
    return {
        init,
        home,
        homeVod,
        category,
        detail,
        play,
        search
    };
}